// OfflineLedger — Receipts Screen
// Create, view, and share/export client transaction receipts
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { Q } from '@nozbe/watermelondb';
import { usersCollection, advancesCollection } from '../db';
import { User } from '../db/models/User';
import { AdvanceEntry } from '../db/models/AdvanceEntry';
import { darkColors } from '../theme/colors';
import { typography, fontWeight } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';
import { formatDate, formatCurrency } from '../utils/formatters';

interface ReceiptsScreenProps {
  userId: string;
}

interface Receipt {
  id: string;
  receiptNumber: string;
  date: number;
  amount: number;
  description: string;
  clientName: string;
  clientPhone: string;
  totalBalance: number;
  remainingBalance: number;
}

export function ReceiptsScreen({ userId }: ReceiptsScreenProps) {
  const [user, setUser] = useState<User | null>(null);
  const [advances, setAdvances] = useState<AdvanceEntry[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Custom receipt creation form state
  const [isCustomModalVisible, setCustomModalVisible] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  useEffect(() => {
    let subUser: any;
    let subAdv: any;

    usersCollection.findAndObserve(userId).subscribe(u => {
      setUser(u);
    });

    advancesCollection
      .query(Q.where('user_id', userId), Q.sortBy('created_at', Q.desc))
      .observe()
      .subscribe(entries => {
        setAdvances(entries);
      });

    return () => {
      subUser?.unsubscribe?.();
      subAdv?.unsubscribe?.();
    };
  }, [userId]);

  const totalAdvance = advances.reduce((sum, item) => sum + item.amount, 0);

  const generateReceiptFromAdvance = (item: AdvanceEntry, index: number): Receipt => {
    const totalBal = user?.totalBalance || 0;
    // Calculate running advance up to this item's point in time
    const receiptNum = `REC-${item.createdAt.toString().slice(-6)}`;
    return {
      id: item.id,
      receiptNumber: receiptNum,
      date: item.createdAt,
      amount: item.amount,
      description: item.description || 'Payment / Advance',
      clientName: user?.name || 'Client',
      clientPhone: user?.phone || '',
      totalBalance: totalBal,
      remainingBalance: totalBal - totalAdvance,
    };
  };

  const handleOpenReceipt = (item: AdvanceEntry, index: number) => {
    const receipt = generateReceiptFromAdvance(item, index);
    setSelectedReceipt(receipt);
    setModalVisible(true);
  };

  const handleCreateCustomReceipt = () => {
    const amt = parseFloat(customAmount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid receipt amount.');
      return;
    }
    const totalBal = user?.totalBalance || 0;
    const newReceipt: Receipt = {
      id: `custom-${Date.now()}`,
      receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
      date: Date.now(),
      amount: amt,
      description: customDesc.trim() || 'Payment Receipt',
      clientName: user?.name || 'Client',
      clientPhone: user?.phone || '',
      totalBalance: totalBal,
      remainingBalance: totalBal - (totalAdvance + amt),
    };

    setCustomModalVisible(false);
    setCustomAmount('');
    setCustomDesc('');
    setSelectedReceipt(newReceipt);
    setModalVisible(true);
  };

  const handleShareReceipt = async () => {
    if (!selectedReceipt) return;
    const text = `
--------------------------------
        R B CO RECEIPT         
--------------------------------
Receipt No: ${selectedReceipt.receiptNumber}
Date: ${formatDate(selectedReceipt.date)}
Client Name: ${selectedReceipt.clientName}
Phone: ${selectedReceipt.clientPhone}

Description: ${selectedReceipt.description}
Amount Paid: PKR ${formatCurrency(selectedReceipt.amount)}

Total Agreed: PKR ${formatCurrency(selectedReceipt.totalBalance)}
Remaining: PKR ${formatCurrency(selectedReceipt.remainingBalance)}
--------------------------------
Thank you for doing business with R B CO!
    `.trim();

    try {
      await Share.share({
        message: text,
        title: `Receipt ${selectedReceipt.receiptNumber}`,
      });
    } catch (err: any) {
      Alert.alert('Share Error', err?.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Transaction Receipts</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => setCustomModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.createBtnText}>+ New Receipt</Text>
        </TouchableOpacity>
      </View>

      {advances.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🧾</Text>
          <Text style={styles.emptyTitle}>No Receipts Yet</Text>
          <Text style={styles.emptySubtitle}>
            Receipts are automatically generated when payments or advances are added, or tap "+ New Receipt" to issue one directly.
          </Text>
        </View>
      ) : (
        <FlatList
          data={advances}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.receiptCard}
              onPress={() => handleOpenReceipt(item, index)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.receiptNum}>
                  REC-{item.createdAt.toString().slice(-6)}
                </Text>
                <Text style={styles.receiptDate}>{formatDate(item.createdAt)}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardDesc} numberOfLines={1}>
                  {item.description || 'Payment / Advance Entry'}
                </Text>
                <Text style={styles.cardAmount}>
                  PKR {formatCurrency(item.amount)}
                </Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.viewReceiptLink}>Tap to view & share ➔</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* ── View / Share Receipt Modal ───────────────────────────────── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.receiptPaper}>
            <Text style={styles.companyName}>R B CO</Text>
            <Text style={styles.receiptHeaderTag}>PAYMENT RECEIPT</Text>

            <View style={styles.divider} />

            {selectedReceipt && (
              <>
                <View style={styles.receiptRow}>
                  <Text style={styles.rowLabel}>Receipt #:</Text>
                  <Text style={styles.rowValue}>{selectedReceipt.receiptNumber}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.rowLabel}>Date:</Text>
                  <Text style={styles.rowValue}>{formatDate(selectedReceipt.date)}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.rowLabel}>Client:</Text>
                  <Text style={styles.rowValue}>{selectedReceipt.clientName}</Text>
                </View>
                {!!selectedReceipt.clientPhone && (
                  <View style={styles.receiptRow}>
                    <Text style={styles.rowLabel}>Phone:</Text>
                    <Text style={styles.rowValue}>{selectedReceipt.clientPhone}</Text>
                  </View>
                )}

                <View style={[styles.divider, { marginVertical: spacing[3] }]} />

                <Text style={styles.rowLabel}>Description:</Text>
                <Text style={styles.descBox}>{selectedReceipt.description}</Text>

                <View style={styles.amountBox}>
                  <Text style={styles.amountBoxLabel}>Amount Paid</Text>
                  <Text style={styles.amountBoxValue}>
                    PKR {formatCurrency(selectedReceipt.amount)}
                  </Text>
                </View>

                <View style={styles.balanceSummary}>
                  <View style={styles.receiptRow}>
                    <Text style={styles.rowLabel}>Total Agreed Balance:</Text>
                    <Text style={styles.rowValue}>
                      PKR {formatCurrency(selectedReceipt.totalBalance)}
                    </Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.rowLabel}>Remaining Balance:</Text>
                    <Text style={[styles.rowValue, { color: darkColors.error }]}>
                      PKR {formatCurrency(selectedReceipt.remainingBalance)}
                    </Text>
                  </View>
                </View>
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={handleShareReceipt}
              >
                <Text style={styles.shareBtnText}>Share Receipt 📤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Custom Receipt Modal ───────────────────────────────────── */}
      <Modal
        visible={isCustomModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.customModalContainer}>
            <Text style={styles.customModalTitle}>Create Instant Receipt</Text>

            <Text style={styles.fieldLabel}>Amount (PKR) *</Text>
            <TextInput
              style={styles.input}
              value={customAmount}
              onChangeText={setCustomAmount}
              placeholder="e.g. 5000"
              placeholderTextColor={darkColors.textDisabled}
              keyboardType="numeric"
            />

            <Text style={styles.fieldLabel}>Description / Notes</Text>
            <TextInput
              style={styles.input}
              value={customDesc}
              onChangeText={setCustomDesc}
              placeholder='e.g. "Cash payment received"'
              placeholderTextColor={darkColors.textDisabled}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setCustomModalVisible(false)}
              >
                <Text style={styles.closeBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={handleCreateCustomReceipt}
              >
                <Text style={styles.shareBtnText}>Generate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkColors.background,
    padding: spacing[4],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  title: {
    ...typography.h3,
    color: darkColors.textPrimary,
    fontWeight: fontWeight.bold,
  },
  createBtn: {
    backgroundColor: darkColors.primaryContainer,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: darkColors.primary,
  },
  createBtnText: {
    ...typography.labelSmall,
    color: darkColors.primary,
    fontWeight: fontWeight.bold,
  },
  listContent: {
    paddingBottom: spacing[6],
    gap: spacing[3],
  },
  receiptCard: {
    backgroundColor: darkColors.surface,
    borderRadius: radius.md,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: darkColors.cardBorder,
    gap: spacing[2],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptNum: {
    ...typography.labelMedium,
    color: darkColors.primary,
    fontWeight: fontWeight.bold,
  },
  receiptDate: {
    ...typography.labelSmall,
    color: darkColors.textDisabled,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  cardDesc: {
    ...typography.bodyMedium,
    color: darkColors.textPrimary,
    flex: 1,
    marginRight: spacing[2],
  },
  cardAmount: {
    ...typography.h3,
    color: darkColors.secondary,
    fontWeight: fontWeight.bold,
  },
  cardFooter: {
    alignItems: 'flex-end',
    marginTop: spacing[1],
  },
  viewReceiptLink: {
    ...typography.labelSmall,
    color: darkColors.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    gap: spacing[2],
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: {
    ...typography.h3,
    color: darkColors.textPrimary,
  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: darkColors.textDisabled,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  receiptPaper: {
    width: '100%',
    backgroundColor: darkColors.surface,
    borderRadius: radius.lg,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: darkColors.border,
  },
  companyName: {
    ...typography.h2,
    color: darkColors.primary,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  receiptHeaderTag: {
    ...typography.labelSmall,
    color: darkColors.textSecondary,
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: darkColors.border,
    marginVertical: spacing[4],
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  rowLabel: {
    ...typography.bodySmall,
    color: darkColors.textSecondary,
  },
  rowValue: {
    ...typography.bodySmall,
    color: darkColors.textPrimary,
    fontWeight: fontWeight.bold,
  },
  descBox: {
    ...typography.bodyMedium,
    color: darkColors.textPrimary,
    backgroundColor: darkColors.surfaceVariant,
    padding: spacing[3],
    borderRadius: radius.sm,
    marginTop: spacing[1],
    marginBottom: spacing[3],
  },
  amountBox: {
    backgroundColor: darkColors.primaryContainer,
    borderRadius: radius.md,
    padding: spacing[4],
    alignItems: 'center',
    marginVertical: spacing[3],
    borderWidth: 1,
    borderColor: darkColors.primary,
  },
  amountBoxLabel: {
    ...typography.labelSmall,
    color: darkColors.textSecondary,
  },
  amountBoxValue: {
    ...typography.h2,
    color: darkColors.primary,
    fontWeight: fontWeight.bold,
  },
  balanceSummary: {
    gap: 4,
    marginTop: spacing[2],
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[3],
    marginTop: spacing[5],
  },
  closeBtn: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: darkColors.surfaceVariant,
  },
  closeBtnText: {
    ...typography.labelMedium,
    color: darkColors.textPrimary,
  },
  shareBtn: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: darkColors.primary,
  },
  shareBtnText: {
    ...typography.labelMedium,
    color: darkColors.textOnPrimary,
    fontWeight: fontWeight.bold,
  },
  customModalContainer: {
    width: '100%',
    backgroundColor: darkColors.surface,
    borderRadius: radius.lg,
    padding: spacing[5],
    gap: spacing[3],
  },
  customModalTitle: {
    ...typography.h3,
    color: darkColors.textPrimary,
    fontWeight: fontWeight.bold,
  },
  fieldLabel: {
    ...typography.labelSmall,
    color: darkColors.textSecondary,
  },
  input: {
    backgroundColor: darkColors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    color: darkColors.textPrimary,
    borderWidth: 1,
    borderColor: darkColors.border,
  },
});
