/* eslint-disable react/prop-types */
import { showMessage } from 'react-native-flash-message'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Pressable, Button, Text, FlatList, ScrollView } from 'react-native'
import { getAllWithoutLogin } from '../../api/RestaurantEndpoints'
import { getTopProducts } from '../../api/ProductEndpoints'
import ImageCard from '../../components/ImageCard'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import { brandPrimary, brandPrimaryTap, brandSecondary, flashStyle, flashTextStyle } from '../../styles/GlobalStyles'

export default function RestaurantsScreen ({ navigation, route }) {
  // TODO: Create a state for storing the restaurants
  const [restaurants, setRestaurants] = useState(null)
  const [topProducts, setTopProducts] = useState(null)

  useEffect(() => {
    // TODO: Fetch all restaurants and set them to state.
    //      Notice that it is not required to be logged in.

    async function fetchRestaurants () {
      try {
        const fetchedRestaurants = await getAllWithoutLogin()
        setRestaurants(fetchedRestaurants)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving restaurants. ${error} `,
          type: 'error',
          style: flashStyle,
          titleStyle: flashTextStyle
        })
      }
    }
    fetchRestaurants() // TODO: set restaurants to state
  }, [route])

  useEffect(() => {
    async function fetchTopProducts () {
      try {
        const fetchedTopProducts = await getTopProducts()
        setTopProducts(fetchedTopProducts)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving the top 3 products. ${error} `,
          type: 'error',
          style: flashStyle,
          titleStyle: flashTextStyle
        })
      }
    }
    fetchTopProducts()
  }, [route])

  const renderRestaurant = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.logo ? { uri: process.env.API_BASE_URL + '/' + item.logo } : undefined}
        title={item.name}
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: item.id })
        }}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        {item.averageServiceMinutes !== null &&
          <TextSemiBold>Avg. service time: <TextSemiBold textStyle={{ color: brandPrimary }}>{item.averageServiceMinutes} min.</TextSemiBold></TextSemiBold>
        }
        <TextSemiBold>Shipping: <TextSemiBold textStyle={{ color: brandPrimary }}>{item.shippingCosts.toFixed(2)}€</TextSemiBold></TextSemiBold>
      </ImageCard>
    )
  }

  const renderTopProduct = (item) => {
    return (
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : undefined}
        title={item.name}
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: item.restaurantId })
        }}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
      </ImageCard>
    )
  }

  const renderHeaderProd = () => {
    return (
      <View>
        <View style={styles.FRHeader}>
          <Text style={{ fontSize: 30, color: 'white', fontWeight: 'bold' }}>TOP PRODUCTS</Text>
        </View>
      </View>
    )
  }

  const renderHeaderRes = () => {
    return (
      <View>
        <View style={styles.FRHeader}>
        <Text style={{ fontSize: 30, color: 'white', fontWeight: 'bold' }}>RESTAURANTS</Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView>
    {renderHeaderProd()}
    {topProducts && topProducts.map(product => renderTopProduct(product))}
      <FlatList
        ListHeaderComponent={renderHeaderRes}
        style={styles.container}
        data={restaurants}
        renderItem={renderRestaurant}
        keyExtractor={item => item.id.toString()} />
        </ScrollView>
  )
}

const styles = StyleSheet.create({
  FRHeader: { // TODO: remove this style and the related <View>. Only for clarification purposes
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#be0f2e',
    height: 60
  },
  container: {
    flex: 1
  }
})
