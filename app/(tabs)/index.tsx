import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, RefreshControl } from 'react-native';
import { MaterialCommunityIcons, Feather, FontAwesome } from '@expo/vector-icons';
import { StorageService } from '@/services/StorageService';
import { mockPriceData } from '@/data/mockData';

interface PriceData {
  id: string;
  crop: string;
  cropFr: string;
  currentPrice: number;
  previousPrice: number;
  unit: string;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

export default function PriceDashboard() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<string>('');

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    try {
      const cachedPrices = await StorageService.getPrices();
      if (cachedPrices && cachedPrices.length > 0) {
        setPrices(cachedPrices);
        const lastSyncTime = await StorageService.getLastSync();
        setLastSync(lastSyncTime || '');
      } else {
        // Load mock data if no cached data
        setPrices(mockPriceData);
        await StorageService.savePrices(mockPriceData);
        await StorageService.setLastSync(new Date().toISOString());
        setLastSync(new Date().toISOString());
      }
    } catch (error) {
      console.error('Error loading prices:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update prices with small random changes
    const updatedPrices = mockPriceData.map(price => ({
      ...price,
      currentPrice: price.currentPrice + (Math.random() - 0.5) * 50,
      lastUpdated: new Date().toISOString(),
    }));
    
    setPrices(updatedPrices);
    await StorageService.savePrices(updatedPrices);
    await StorageService.setLastSync(new Date().toISOString());
    setLastSync(new Date().toISOString());
    setRefreshing(false);
  };

  const formatPrice = (price: number) => {
    return `${Math.round(price).toLocaleString()} CFA`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTrendIcon = (trend: string, changePercent: number) => {
    if (trend === 'up') {
      return <Feather name="trending-up" size={20} color="#16a34a" />;
    } else if (trend === 'down') {
      return <Feather name="trending-down" size={20} color="#dc2626" />;
    }
    return <View style={{ width: 20, height: 20 }} />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary-600 px-4 pt-12 pb-6">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-white text-2xl font-bold">Adja-oko</Text>
          {isOnline ? (
            <Feather name="wifi" size={24} color="white" />
          ) : (
            <Feather name="wifi-off" size={24} color="white" />
          )}
        </View>
        <Text className="text-primary-100 text-lg">Prix du Marché</Text>
        {lastSync && (
          <View className="flex-row items-center mt-2">
            <Feather name="clock" size={16} color="#bbf7d0" />
            <Text className="text-primary-200 text-sm ml-2">
              Mis à jour: {formatDate(lastSync)}
            </Text>
          </View>
        )}
      </View>

      <ScrollView 
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#16a34a']}
            tintColor="#16a34a"
          />
        }
      >
        {prices.map((item) => (
          <View key={item.id} className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">{item.cropFr}</Text>
                <Text className="text-sm text-gray-500">{item.crop}</Text>
              </View>
              <View className="items-end">
                <Text className="text-xl font-bold text-primary-600">
                  {formatPrice(item.currentPrice)}
                </Text>
                <Text className="text-sm text-gray-500">par {item.unit}</Text>
              </View>
            </View>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                {getTrendIcon(item.trend, item.changePercent)}
                <Text className={`ml-2 text-sm font-semibold ${getTrendColor(item.trend)}`}>
                  {item.changePercent > 0 ? '+' : ''}{item.changePercent.toFixed(1)}%
                </Text>
              </View>
              <Text className="text-xs text-gray-400">
                {formatDate(item.lastUpdated)}
              </Text>
            </View>
            
            <View className="mt-2 pt-2 border-t border-gray-100">
              <Text className="text-xs text-gray-500">
                Prix précédent: {formatPrice(item.previousPrice)} CFA
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}