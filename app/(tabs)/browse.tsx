import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, TextInput, Linking } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Feather, FontAwesome, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import { SupabaseService } from '@/services/SupabaseService';


interface Listing {
  id: string;
  croptype: string;
  quantity: string;
  unit: string;
  location: string;
  price: string;
  contact: string;
  description: string;
  dateposted: string;
  status: string;
}

const cropOptions = [
  { value: '', label: 'Toutes les cultures' },
  { value: 'maize', label: 'Maïs' },
  { value: 'cassava', label: 'Manioc' },
  { value: 'yam', label: 'Igname' },
  { value: 'cotton', label: 'Coton' },
  { value: 'coffee', label: 'Café' },
  { value: 'cocoa', label: 'Cacao' },
  { value: 'rice', label: 'Riz' },
  { value: 'beans', label: 'Haricots' },
];

const locationOptions = [
  { value: '', label: 'Toutes les villes' },
  { value: 'Lomé', label: 'Lomé' },
  { value: 'Kpalimé', label: 'Kpalimé' },
  { value: 'Atakpamé', label: 'Atakpamé' },
  { value: 'Sokodé', label: 'Sokodé' },
  { value: 'Kara', label: 'Kara' },
  { value: 'Dapaong', label: 'Dapaong' },
];

export default function BrowseListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'crop' | 'location' | null>(null);

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, searchText, selectedCrop, selectedLocation]);

  const loadListings = async () => {
    try {
      const listings = await SupabaseService.getListings();
      setListings(listings);
    } catch (error) {
      console.error('Error loading listings:', error);
      setListings([]);
    }
  };

  const filterListings = () => {
    let filtered = listings;

    if (searchText) {
      filtered = filtered.filter(listing =>
        getCropLabel(listing.croptype).toLowerCase().includes(searchText.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedCrop) {
      filtered = filtered.filter(listing => listing.croptype === selectedCrop);
    }

    if (selectedLocation) {
      filtered = filtered.filter(listing => listing.location === selectedLocation);
    }

    setFilteredListings(filtered);
  };

  const getCropLabel = (cropType: string) => {
    const crop = cropOptions.find(c => c.value === cropType);
    return crop ? crop.label : cropType;
  };

  const formatPrice = (price: string) => {
    const num = Number(price);
    if (isNaN(num)) return `${price} CFA`;
    return `${num.toLocaleString('fr-FR')} CFA`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const handleCall = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/\s/g, '');
    Linking.openURL(`tel:${cleanNumber}`);
  };

  const handleWhatsApp = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/\s/g, '').replace('+', '');
    const message = encodeURIComponent('Bonjour, je suis intéressé par votre annonce sur Adja-oko.');
    Linking.openURL(`whatsapp://send?phone=${cleanNumber}&text=${message}`);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary-600 px-4 pt-12 pb-6">
        <Text className="text-white text-2xl font-bold">Acheter</Text>
        <Text className="text-primary-100 text-base">Trouvez des produits agricoles</Text>
      </View>

      {/* Search and Filters */}
      <View className="px-4 py-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center mb-3">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <Feather name="search" size={20} color="#6b7280" />
            <TextInput
              className="flex-1 ml-2 text-base"
              placeholder="Rechercher..."
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <TouchableOpacity
            className="ml-3 p-2 bg-primary-100 rounded-lg"
            onPress={() => setShowFilters(!showFilters)}
          >
            <Feather name="filter" size={20} color="#16a34a" />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View className="space-y-3">
            {activeFilter === null && (
              <View className="flex-row justify-around">
                <TouchableOpacity
                  className="bg-primary-100 px-4 py-2 rounded-lg"
                  onPress={() => setActiveFilter('crop')}
                >
                  <Text className="text-primary-600 font-semibold">Filtrer par culture</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-primary-100 px-4 py-2 rounded-lg"
                  onPress={() => setActiveFilter('location')}
                >
                  <Text className="text-primary-600 font-semibold">Filtrer par ville</Text>
                </TouchableOpacity>
              </View>
            )}
            {activeFilter === 'crop' && (
              <View>
                <Dropdown
                  style={{ height: 50, paddingHorizontal: 8 }}
                  data={cropOptions}
                  labelField="label"
                  valueField="value"
                  placeholder="Toutes les cultures"
                  value={selectedCrop}
                  onChange={item => setSelectedCrop(item.value)}
                />
                <TouchableOpacity
                  className="mt-2 bg-gray-200 px-4 py-2 rounded-lg"
                  onPress={() => setActiveFilter(null)}
                >
                  <Text className="text-gray-700 font-semibold">Retour</Text>
                </TouchableOpacity>
              </View>
            )}
            {activeFilter === 'location' && (
              <View>
                <Dropdown
                  style={{ height: 50, paddingHorizontal: 8 }}
                  data={locationOptions}
                  labelField="label"
                  valueField="value"
                  placeholder="Toutes les villes"
                  value={selectedLocation}
                  onChange={item => setSelectedLocation(item.value)}
                />
                <TouchableOpacity
                  className="mt-2 bg-gray-200 px-4 py-2 rounded-lg"
                  onPress={() => setActiveFilter(null)}
                >
                  <Text className="text-gray-700 font-semibold">Retour</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {filteredListings.length === 0 ? (
          <View className="bg-white rounded-lg p-8 text-center items-center">
            <MaterialCommunityIcons name="package-variant" size={64} color="#d1d5db" />
            <Text className="text-gray-500 text-xl font-semibold mt-4">Aucun produit disponible</Text>
            <Text className="text-gray-400 text-sm mt-2 text-center">
              {searchText || selectedCrop || selectedLocation 
                ? "Essayez de modifier vos critères de recherche"
                : "Aucune annonce n'est disponible pour le moment"
              }
            </Text>
          </View>
        ) : (
          filteredListings.map((listing) => (
            <View key={listing.id} className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-100">
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-900">
                    {getCropLabel(listing.croptype)}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Entypo name="location-pin" size={16} color="#6b7280" />
                    <Text className="text-gray-600 ml-1">{listing.location}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-xl font-bold text-primary-600">
                    {formatPrice(listing.price)}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {listing.quantity} {listing.unit}
                  </Text>
                </View>
              </View>

              {listing.description && (
                <Text className="text-gray-700 mb-3 text-sm">{listing.description}</Text>
              )}

              <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="calendar-month-outline" size={14} color="#6b7280" />
                  <Text className="text-gray-500 text-xs ml-1">
                      {formatDate(listing.dateposted)}
                  </Text>
                </View>
                
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    className="bg-blue-100 px-3 py-2 rounded-lg flex-row items-center"
                    onPress={() => handleCall(listing.contact)}
                  >
                    <Feather name="phone" size={16} color="#2563eb" />
                    <Text className="text-blue-600 text-sm font-semibold ml-1">Appeler</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="bg-green-100 px-3 py-2 rounded-lg flex-row items-center"
                    onPress={() => handleWhatsApp(listing.contact)}
                  >
                    <FontAwesome name="whatsapp" size={16} color="#16a34a" />
                    <Text className="text-green-600 text-sm font-semibold ml-1">WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}