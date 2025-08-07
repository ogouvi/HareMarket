import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { MaterialIcons, Feather, FontAwesome, AntDesign } from '@expo/vector-icons';
import { SupabaseService } from '@/services/SupabaseService';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  usertype: 'farmer' | 'buyer' | 'both';
  description: string;
}

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

const userTypeOptions = [
  { value: 'farmer', label: 'Agriculteur', description: 'Je vends des produits agricoles' },
  { value: 'buyer', label: 'Acheteur', description: 'J\'achète des produits agricoles' },
  { value: 'both', label: 'Les deux', description: 'J\'achète et je vends' },
];

export default function Profile() {
  const { user, session, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    location: '',
    usertype: 'farmer',
    description: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user && session?.user?.id) {
      loadProfile();
    }
  }, [user, session]);

  const loadProfile = async () => {
    if (!user || !session?.user?.id) return;
    
    try {
      const savedProfile = await SupabaseService.getProfile(session.user.id);
      if (savedProfile) {
        setProfile(savedProfile);
      } else {
        setIsEditing(true); // First time user, enable editing
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setIsEditing(true); // Enable editing if error
    }
  };

  const handleSave = async () => {
    if (!user || !session?.user?.id) {
      Alert.alert('Erreur', 'Vous devez être connecté pour sauvegarder votre profil.');
      return;
    }

    // Validation
    if (!profile.name || !profile.phone || !profile.location) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^(\+228)?[0-9]{8}$/;
    if (!phoneRegex.test(profile.phone.replace(/\s/g, ''))) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide (+228XXXXXXXX).');
      return;
    }

    setLoading(true);

    try {
      const result = await SupabaseService.saveProfile(profile);
      if (result) {
        setIsEditing(false);
        Alert.alert('Succès', 'Votre profil a été sauvegardé.');
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await signOut();
      // Optionally, you can show a message or redirect
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion.');
    } finally {
      setLogoutLoading(false);
    }
  };

  const getUserTypeLabel = (type: string) => {
    const usertype = userTypeOptions.find(u => u.value === type);
    return usertype ? usertype.label : type;
  };

  const getUserTypeDescription = (type: string) => {
    const usertype = userTypeOptions.find(u => u.value === type);
    return usertype ? usertype.description : '';
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
        <Text className="text-lg text-center px-6 mb-4">
          Vous devez être connecté pour accéder à votre profil.
        </Text>
        <TouchableOpacity
          className="bg-primary-600 px-6 py-3 rounded-lg"
          onPress={() => {
            // Navigate to sign-up screen or open sign-up modal
            // If using expo-router:
            if (typeof useRouter === 'function') {
              const router = useRouter();
              router.push('/auth/sign-up');
            }
            // Otherwise, you can trigger a modal or navigation as needed
          }}
        >
          <Text className="text-white text-lg font-semibold">Créer un compte</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary-600 px-4 pt-12 pb-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-2xl font-bold">Mon Profil</Text>
            <Text className="text-primary-100 text-base">
              {profile.name || 'Nouveau utilisateur'}
            </Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity
              className="bg-primary-500 p-3 rounded-full mr-2"
              onPress={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 
                <MaterialIcons name="save" size={24} color="white" /> : 
                <FontAwesome name="edit" size={24} color="white" />
              }
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-500 p-3 rounded-full"
              onPress={handleLogout}
              disabled={logoutLoading}
              accessibilityLabel="Se déconnecter"
            >
              <AntDesign name="logout" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Profile Picture Placeholder */}
        <View className="items-center mb-6">
          <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center">
            <MaterialIcons name="person" size={40} color="#16a34a" />
          </View>
          <Text className="text-gray-600 text-sm mt-2">
            {getUserTypeLabel(profile.usertype)}
          </Text>
        </View>

        {/* Name */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Nom complet *</Text>
          {isEditing ? (
            <TextInput
              className="border border-gray-200 rounded-lg px-3 py-3 text-base bg-gray-50"
              placeholder="Votre nom complet"
              value={profile.name}
              onChangeText={(value) => setProfile({ ...profile, name: value })}
            />
          ) : (
            <Text className="text-gray-800 text-base py-2">
              {profile.name || 'Non défini'}
            </Text>
          )}
        </View>

        {/* Phone */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <Feather name="phone" size={20} color="#16a34a" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Téléphone *</Text>
          </View>
          {isEditing ? (
            <TextInput
              className="border border-gray-200 rounded-lg px-3 py-3 text-base bg-gray-50"
              placeholder="+228XXXXXXXX"
              value={profile.phone}
              onChangeText={(value) => setProfile({ ...profile, phone: value })}
              keyboardType="phone-pad"
            />
          ) : (
            <Text className="text-gray-800 text-base py-2">
              {profile.phone || 'Non défini'}
            </Text>
          )}
        </View>

        {/* Location */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <Feather name="map-pin" size={20} color="#16a34a" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Localisation *</Text>
          </View>
          {isEditing ? (
            <View className="border border-gray-200 rounded-lg">
              <Dropdown
                style={{ height: 50, paddingHorizontal: 8 }}
                data={locationOptions.map(location => ({ value: location, label: location }))}
                labelField="label"
                valueField="value"
                placeholder="Sélectionnez une ville..."
                value={profile.location}
                onChange={(item: any) => setProfile({ ...profile, location: item.value })}
              />
            </View>
          ) : (
            <Text className="text-gray-800 text-base py-2">
              {profile.location || 'Non défini'}
            </Text>
          )}
        </View>

        {/* User Type */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Type d'utilisateur</Text>
          {isEditing ? (
            <View className="border border-gray-200 rounded-lg">
              <Dropdown
                style={{ height: 50, paddingHorizontal: 8 }}
                data={userTypeOptions}
                labelField="label"
                valueField="value"
                placeholder="Sélectionnez un type"
                value={profile.usertype}
                onChange={(item: any) => setProfile({ ...profile, usertype: item.value as 'farmer' | 'buyer' | 'both' })}
              />
            </View>
          ) : (
            <View>
              <Text className="text-gray-800 text-base py-1">
                {getUserTypeLabel(profile.usertype)}
              </Text>
              <Text className="text-gray-600 text-sm">
                {getUserTypeDescription(profile.usertype)}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Description</Text>
          {isEditing ? (
            <TextInput
              className="border border-gray-200 rounded-lg px-3 py-3 text-base bg-gray-50"
              placeholder="Parlez-nous de vous et de votre activité..."
              value={profile.description}
              onChangeText={(value) => setProfile({ ...profile, description: value })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          ) : (
            <Text className="text-gray-800 text-base py-2">
              {profile.description || 'Aucune description'}
            </Text>
          )}
        </View>

        {/* Save button */}
        {isEditing && (
          <TouchableOpacity
            className={`rounded-lg py-4 px-6 ${loading ? 'bg-gray-400' : 'bg-primary-600'}`}
            onPress={handleSave}
            disabled={loading}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {loading ? 'Sauvegarde...' : 'Sauvegarder le Profil'}
            </Text>
          </TouchableOpacity>
        )}

        <View className="h-4" />
      </ScrollView>
    </View>
  );
}