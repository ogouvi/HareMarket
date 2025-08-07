import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { MaterialIcons, Feather, FontAwesome } from '@expo/vector-icons';
import { SupabaseService } from '@/services/SupabaseService';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

interface PostHarvestForm {
  croptype: string;
  quantity: string;
  unit: string;
  location: string;
  price: string;
  contact: string;
  description: string;
}

const cropOptions = [
  { value: 'maize', label: 'Maïs', labelFr: 'Maïs' },
  { value: 'cassava', label: 'Cassava', labelFr: 'Manioc' },
  { value: 'yam', label: 'Yam', labelFr: 'Igname' },
  { value: 'cotton', label: 'Cotton', labelFr: 'Coton' },
  { value: 'coffee', label: 'Coffee', labelFr: 'Café' },
  { value: 'cocoa', label: 'Cocoa', labelFr: 'Cacao' },
  { value: 'rice', label: 'Rice', labelFr: 'Riz' },
  { value: 'beans', label: 'Beans', labelFr: 'Haricots' },
];

const locationOptions = [
  'Lomé',
  'Kpalimé', 
  'Atakpamé',
  'Sokodé',
  'Kara',
  'Dapaong',
  'Tsévié',
  'Aného',
];

const unitOptions = [
  { value: 'kg', label: 'Kilogrammes (kg)' },
  { value: 'sac', label: 'Sacs (50kg)' },
  { value: 'tonne', label: 'Tonnes' },
];

export default function PostHarvest() {
  const { user, session, loading: authLoading } = useAuth();
  const [form, setForm] = useState<PostHarvestForm>({
    croptype: '',
    quantity: '',
    unit: 'kg',
    location: '',
    price: '',
    contact: '',
    description: '',
  });
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      Alert.alert(
        'Authentification requise',
        'Vous devez être connecté pour publier une annonce.',
        [
          {
            text: 'OK',
            onPress: () => {
              // You can redirect to sign-in here if needed
              router.push('/auth/sign-in');
            }
          }
        ]
      );
    }
  }, [user, authLoading]);

  const handleSubmit = async () => {
    // Check if user is authenticated
    if (!user || !session) {
      Alert.alert('Erreur', 'Vous devez être connecté pour publier une annonce.');
      return;
    }

    // Check if user has a valid session
    if (!session.user?.id) {
      Alert.alert('Erreur', 'Session utilisateur invalide. Veuillez vous reconnecter.');
      return;
    }

    // Validation
    if (!form.croptype || !form.quantity || !form.location || !form.price || !form.contact) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^(\+228)?[0-9]{8}$/;
    if (!phoneRegex.test(form.contact.replace(/\s/g, ''))) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide (+228 XX XX XX XX).');
      return;
    }

    setLoading(true);

    try {
      console.log('Creating listing with user_id:', session.user.id);
      
      const listing = {
        croptype: form.croptype,
        quantity: form.quantity,
        unit: form.unit,
        location: form.location,
        price: form.price,
        contact: form.contact,
        description: form.description,
        dateposted: new Date().toISOString(),
        status: 'active',
        user_id: session.user.id, // Use session user ID
      };

      const result = await SupabaseService.addListing(listing);

      if (result) {
        Alert.alert(
          'Succès!', 
          'Votre annonce a été publiée avec succès.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setForm({
                  croptype: '',
                  quantity: '',
                  unit: 'kg',
                  location: '',
                  price: '',
                  contact: '',
                  description: '',
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue lors de la publication.');
      }
    } catch (error) {
      console.error('Error adding listing:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la publication.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading or not authenticated message
  if (authLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg">Chargement...</Text>
      </View>
    );
  }

  if (!user || !session) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-center px-6">
          Vous devez être connecté pour publier une annonce.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary-600 px-4 pt-12 pb-6">
        <Text className="text-white text-2xl font-bold">Vendre ma Récolte</Text>
        <Text className="text-primary-100 text-base">Publiez votre annonce</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Crop Type */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="local-florist" size={20} color="#16a34a" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Type de Culture *</Text>
          </View>
          <View className="border border-gray-200 rounded-lg">
            <Dropdown
              style={{ height: 50, paddingHorizontal: 8 }}
              data={cropOptions}
              labelField="labelFr"
              valueField="value"
              placeholder="Sélectionnez une culture..."
                value={form.croptype}
              onChange={(item: any) => setForm({ ...form, croptype: item.value })}
            />
          </View>
        </View>

        {/* Quantity & Unit */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Quantité *</Text>
          <View className="flex-row space-x-3">
            <View className="flex-1">
              <TextInput
                className="border border-gray-200 rounded-lg px-3 py-3 text-base bg-gray-50"
                placeholder="Ex: 100"
                value={form.quantity}
                onChangeText={(value) => setForm({ ...form, quantity: value })}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <View className="border border-gray-200 rounded-lg">
                <Dropdown
                  style={{ height: 50, paddingHorizontal: 8 }}
                  data={unitOptions}
                  labelField="label"
                  valueField="value"
                  placeholder="Unité"
                  value={form.unit}
                  onChange={(item: any) => setForm({ ...form, unit: item.value })}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Location */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <Feather name="map-pin" size={20} color="#16a34a" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Localisation *</Text>
          </View>
          <View className="border border-gray-200 rounded-lg">
            <Dropdown
              style={{ height: 50, paddingHorizontal: 8 }}
              data={locationOptions.map(location => ({ value: location, label: location }))}
              labelField="label"
              valueField="value"
              placeholder="Sélectionnez une ville..."
              value={form.location}
              onChange={(item: any) => setForm({ ...form, location: item.value })}
            />
          </View>
        </View>

        {/* Price */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <FontAwesome name="money" size={20} color="#16a34a" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Prix (CFA) *</Text>
          </View>
          <TextInput
            className="border border-gray-200 rounded-lg px-3 py-3 text-base bg-gray-50"
            placeholder="Ex: 250000"
            value={form.price}
            onChangeText={(value) => setForm({ ...form, price: value })}
            keyboardType="numeric"
          />
          <Text className="text-sm text-gray-500 mt-1">Prix total ou par {form.unit}</Text>
        </View>

        {/* Contact */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <Feather name="phone" size={20} color="#16a34a" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Contact *</Text>
          </View>
          <TextInput
            className="border border-gray-200 rounded-lg px-3 py-3 text-base bg-gray-50"
            placeholder="+228 XX XX XX XX"
            value={form.contact}
            onChangeText={(value) => setForm({ ...form, contact: value })}
            keyboardType="phone-pad"
          />
        </View>

        {/* Description */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Description</Text>
          <TextInput
            className="border border-gray-200 rounded-lg px-3 py-3 text-base bg-gray-50"
            placeholder="Informations supplémentaires sur votre récolte..."
            value={form.description}
            onChangeText={(value) => setForm({ ...form, description: value })}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit button */}
        <TouchableOpacity
          className={`rounded-lg py-4 px-6 ${loading ? 'bg-gray-400' : 'bg-primary-600'}`}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {loading ? 'Publication...' : 'Publier mon Annonce'}
          </Text>
        </TouchableOpacity>

        <View className="h-4" />
      </ScrollView>
    </View>
  );
}