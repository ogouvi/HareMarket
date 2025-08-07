import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface Listing {
  id: string;
  cropType: string;
  quantity: string;
  unit: string;
  location: string;
  price: string;
  contact: string;
  description: string;
  datePosted: string;
  status: string;
}

interface UserProfile {
  name: string;
  phone: string;
  location: string;
  userType: 'farmer' | 'buyer' | 'both';
  description: string;
}

export class StorageService {
  private static PRICES_KEY = 'adja_oko_prices';
  private static LISTINGS_KEY = 'adja_oko_listings';
  private static PROFILE_KEY = 'adja_oko_profile';
  private static LAST_SYNC_KEY = 'adja_oko_last_sync';

  // Prices
  static async savePrices(prices: PriceData[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.PRICES_KEY, JSON.stringify(prices));
    } catch (error) {
      console.error('Error saving prices:', error);
    }
  }

  static async getPrices(): Promise<PriceData[] | null> {
    try {
      const prices = await AsyncStorage.getItem(this.PRICES_KEY);
      return prices ? JSON.parse(prices) : null;
    } catch (error) {
      console.error('Error getting prices:', error);
      return null;
    }
  }

  // Listings
  static async addListing(listing: Listing): Promise<void> {
    try {
      const existingListings = await this.getListings();
      const updatedListings = existingListings ? [listing, ...existingListings] : [listing];
      await AsyncStorage.setItem(this.LISTINGS_KEY, JSON.stringify(updatedListings));
    } catch (error) {
      console.error('Error adding listing:', error);
    }
  }

  static async getListings(): Promise<Listing[] | null> {
    try {
      const listings = await AsyncStorage.getItem(this.LISTINGS_KEY);
      return listings ? JSON.parse(listings) : null;
    } catch (error) {
      console.error('Error getting listings:', error);
      return null;
    }
  }

  // Profile
  static async saveProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }

  static async getProfile(): Promise<UserProfile | null> {
    try {
      const profile = await AsyncStorage.getItem(this.PROFILE_KEY);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  // Last Sync
  static async setLastSync(date: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.LAST_SYNC_KEY, date);
    } catch (error) {
      console.error('Error setting last sync:', error);
    }
  }

  static async getLastSync(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.LAST_SYNC_KEY);
    } catch (error) {
      console.error('Error getting last sync:', error);
      return null;
    }
  }

  // Clear all data (for testing)
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.PRICES_KEY,
        this.LISTINGS_KEY,
        this.PROFILE_KEY,
        this.LAST_SYNC_KEY,
      ]);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}