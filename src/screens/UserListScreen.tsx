// OfflineLedger — User List Screen (Full Implementation)
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserCard } from '../components/UserCard';
import { User } from '../db/models/User';
import { usersCollection } from '../db';
import { darkColors } from '../theme/colors';
import { typography, fontWeight } from '../theme/typography';
import { spacing, radius, shadow } from '../theme/spacing';
import { UserStackParamList } from '../navigation/UserStackNavigator';

type NavProp = StackNavigationProp<UserStackParamList, 'UserList'>;

export function UserListScreen() {
  const navigation = useNavigation<NavProp>();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [query, setQuery] = useState('');

  // Subscribe to the users collection — re-renders automatically on any DB change
  useEffect(() => {
    const subscription = usersCollection
      .query()
      .observe()
      .subscribe(users => setAllUsers(users));
    return () => subscription.unsubscribe();
  }, []);

  // Client-side filter by name or phone
  const filteredUsers = useMemo(() => {
    if (!query.trim()) return allUsers;
    const q = query.toLowerCase();
    return allUsers.filter(
      u =>
        u.name?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        u.cnic?.toLowerCase().includes(q),
    );
  }, [allUsers, query]);

  const handleUserPress = useCallback(
    (user: User) => {
      navigation.navigate('UserDetail', { userId: user.id });
    },
    [navigation],
  );

  const handleAddPress = useCallback(() => {
    navigation.navigate('AddEditUser', {});
  }, [navigation]);

  const renderItem: ListRenderItem<User> = useCallback(
    ({ item }) => <UserCard user={item} onPress={handleUserPress} />,
    [handleUserPress],
  );

  const keyExtractor = useCallback((item: User) => item.id, []);

  const EmptyState = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>👷</Text>
        <Text style={styles.emptyTitle}>No clients added yet</Text>
        <Text style={styles.emptyHint}>
          Tap the + button to add your first client record
        </Text>
      </View>
    ),
    [query],
  );

  const ListHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        {/* Search bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients by name, phone, CNIC..."
            placeholderTextColor={darkColors.textDisabled}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Count badge */}
        {allUsers.length > 0 && (
          <Text style={styles.countLabel}>
            {filteredUsers.length} of {allUsers.length} workers
          </Text>
        )}
      </View>
    ),
    [query, allUsers.length, filteredUsers.length],
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={filteredUsers}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={[
          styles.listContent,
          filteredUsers.length === 0 && styles.listContentEmpty,
        ]}
        ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={15}
        maxToRenderPerBatch={20}
        windowSize={10}
        removeClippedSubviews
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddPress}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: darkColors.background,
  },
  listContent: {
    paddingBottom: 100, // room for FAB
    paddingTop: spacing[2],
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    gap: spacing[2],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkColors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: darkColors.border,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2] + 2,
    gap: spacing[2],
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMedium,
    color: darkColors.textPrimary,
    padding: 0,
    margin: 0,
  },
  clearBtn: {
    fontSize: 14,
    color: darkColors.textDisabled,
    paddingHorizontal: spacing[1],
  },
  countLabel: {
    ...typography.labelSmall,
    color: darkColors.textDisabled,
    textAlign: 'right',
    paddingRight: spacing[1],
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    gap: spacing[3],
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    ...typography.h3,
    color: darkColors.textPrimary,
    textAlign: 'center',
  },
  emptyHint: {
    ...typography.bodyMedium,
    color: darkColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: spacing[6],
    right: spacing[5],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: darkColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.lg,
    // Gold glow effect
    shadowColor: darkColors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  fabIcon: {
    fontSize: 30,
    color: darkColors.textOnPrimary,
    lineHeight: 34,
    fontWeight: fontWeight.bold,
  },
});
