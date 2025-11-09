import {
  StyleSheet,
  ScrollView,
  Platform,
  SafeAreaView,
  useColorScheme,
} from 'react-native'
import { ThemedView } from '@/components/themed-view'
import { Colors } from '@/constants/theme'
import React from 'react'

import {
  userData,
  creditData,
  categories,
  homeBills,
  transactions,
} from '@/data/homeData'

import { HomeHeader } from '@/components/organisms/HomeHeader'
import { CreditCard } from '@/components/organisms/CreditCard'
import { CategoryList } from '@/components/organisms/CategoryList'
import { BillList } from '@/components/organisms/BillList'
import { TransactionList } from '@/components/organisms/TransactionList'

const getDynamicStyles = (themeColors: (typeof Colors)['light']) => {
  return StyleSheet.create({
    safeAreaWrapper: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    safeArea: {
      flex: 1,
    },
    container: {
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'android' ? 30 : 10,
    },
  })
}

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light'
  const themeColors = Colors[colorScheme]
  const styles = getDynamicStyles(themeColors)

  const formatCurrency = (amount: number) => {
    return `${creditData.currency} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return (
    <SafeAreaView style={styles.safeAreaWrapper}>
      <ThemedView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <HomeHeader
            name={userData.name}
            profileImageUrl={userData.profileImageUrl}
          />

          <CreditCard
            available={creditData.available}
            total={creditData.total}
            currency={creditData.currency}
          />

          <CategoryList categories={categories} />

          <BillList bills={homeBills} formatCurrency={formatCurrency} />

          <TransactionList
            transactions={transactions}
            formatCurrency={formatCurrency}
          />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  )
}
