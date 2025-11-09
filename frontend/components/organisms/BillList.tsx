import React from 'react'
import { View, ScrollView, StyleSheet, useColorScheme } from 'react-native'
import { SectionHeader } from '@/components/molecules/SectionHeader'
import { BillCard } from '@/components/molecules/BillCard'
import { ThemedText } from '@/components/themed-text'
import { Colors } from '@/constants/theme'

type Bill = {
  id: string
  title: string
  date: string
  amount: number
  status: string
}

export const BillList = ({
  bills,
  formatCurrency,
}: {
  bills: Bill[]
  formatCurrency: (amount: number) => string
}) => {
  const colorScheme = useColorScheme() ?? 'light'
  const themeColors = Colors[colorScheme]
  const styles = getStyles(themeColors)

  const hasBills = bills && bills.length > 0

  return (
    <View style={styles.sectionContainer}>
      <SectionHeader title="Your Bills" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.billScrollView,
          !hasBills && styles.emptyContainer,
        ]}
      >
        {hasBills ? (
          bills.map((bill, index) => (
            <View key={bill.id} style={{ marginRight: 8 }}>
              <BillCard
                bill={bill}
                formatCurrency={formatCurrency}
                index={index}
              />
            </View>
          ))
        ) : (
          <ThemedText style={styles.noBillsText}>
            You have no upcoming bills.
          </ThemedText>
        )}
      </ScrollView>
    </View>
  )
}

const getStyles = (themeColors: (typeof Colors)['light']) =>
  StyleSheet.create({
    sectionContainer: {
      marginBottom: 20,
    },
    billScrollView: {
      paddingLeft: 2,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noBillsText: {
      fontSize: 14,
      color: themeColors.icon,
    },
  })
