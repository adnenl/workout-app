
import icons from '@/constants/icons';
import { login } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { Redirect } from 'expo-router';
import React from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '../constants/images';

const SignIn = () => {

    const { refetch, loading, isLoggedIn } = useGlobalContext();

    if (!loading && isLoggedIn) return <Redirect href='/' />;

    const handleLogin = async () => {
        const result = await login();

        if (result) {
            refetch();
        } else {
            Alert.alert('Login failed', 'Please try again.');
        }
    };

  return (
    <SafeAreaView className='bg-white h-full'>
        <ScrollView contentContainerClassName='h-full'>
            <Image source={images.onboarding} className='w-full h-4/6' />
            <View>
                <Text className='text-base text-center uppercase font-rubik text-black-200'>Welcome to Workout App</Text>

                <Text className='text-3xl text-center font-rubik-bold text-black-300 mt-2'>Track Your Workouts {"\n"} 
                    <Text>and Explore Exercises</Text>
                </Text>
                
                <Text className='text-lg font-rubik text-black-200 text-center mt-12'>Login with Google</Text>

                <TouchableOpacity onPress={handleLogin} className='bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4 mt-5'>
                    <View className='flex flex-row items-center justify-center'>
                    <Image source={icons.google} className='w-5 h-5' resizeMode='contain' />
                    <Text className='text-lg font-rubik-medium text-black-300 ml-2'>Continue with Google</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn;