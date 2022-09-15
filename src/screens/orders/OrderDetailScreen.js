/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image, Pressable } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import { brandPrimary, brandPrimaryTap, brandSecondary, flashStyle, flashTextStyle } from '../../styles/GlobalStyles'
import { getOrderDetail } from '../../api/OrderEndpoints'
import moment from 'moment'

export default function OrderDetailScreen ({ navigation, route }) {
  const [order, setOrder] = useState(null)

  useEffect(() => {
    async function fetchOrderDetail () {
      try {
        const fetchedOrder = await getOrderDetail(route.params.id)
        setOrder(fetchedOrder)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving the details of your order. ${error} `,
          type: 'error',
          style: flashStyle,
          titleStyle: flashTextStyle
        })
      }
    }
    fetchOrderDetail()
  }, [route])

  const renderHeader = () => {
    return (
      <ImageBackground source={(order.restaurant?.heroImage) ? { uri: process.env.API_BASE_URL + '/' + order.restaurant.heroImage, cache: 'force-cache' } : undefined} style={styles.imageBackground}>
      <View style={styles.restaurantHeaderContainer}>
        <TextSemiBold textStyle={styles.textTitle}>{order.restaurant.name}</TextSemiBold>
        <Image style={styles.image} source={order.restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + order.restaurant.logo, cache: 'force-cache' } : undefined} />
        <TextRegular textStyle={styles.description}>{order.restaurant.description}</TextRegular>
        <TextSemiBold textStyle={styles.description}>Price: {order.price}€</TextSemiBold>
        <TextSemiBold textStyle={styles.description}>Created at: {moment(order.createdAt).format('DD MMM YYYY')}</TextSemiBold>
      </View>
    </ImageBackground>
    )
  }

  const renderOrder = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : undefined}
        title={item.name}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold>Quantity: {item.OrderProducts.quantity}</TextSemiBold>
        <TextSemiBold textStyle={styles.price}>Unit price: {item.price.toFixed(2)}€</TextSemiBold>
        <TextSemiBold textStyle={styles.price}>Total price: {(item.price * item.OrderProducts.quantity).toFixed(2)}€</TextSemiBold>
      </ImageCard>
    )
  }

  const renderEmptyProductsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        This order has no products.
      </TextRegular>
    )
  }

  return (
    <>
    {order && order.restaurant && <FlatList
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyProductsList}
          style={styles.container}
          data={order.products}
          renderItem={renderOrder}
          keyExtractor={item => item.id.toString()}
        />
    }
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: brandSecondary
  },
  restaurantHeaderContainer: {
    height: 250,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  image: {
    height: 100,
    width: 100,
    margin: 10
  },
  description: {
    color: 'white'
  },
  textTitle: {
    fontSize: 20,
    color: 'white'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center'
  },
  text: {
    fontSize: 16,
    color: brandSecondary,
    textAlign: 'center',
    marginLeft: 5
  }
})
