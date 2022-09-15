/* eslint-disable react/prop-types */
import React, { useEffect, useState, useContext } from 'react'
import { StyleSheet, View, Pressable, FlatList } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getIndexCustomer } from '../../api/OrderEndpoints'
import ImageCard from '../../components/ImageCard'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import { brandPrimary, brandPrimaryTap, brandSecondary, flashStyle, flashTextStyle } from '../../styles/GlobalStyles'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import moment from 'moment'

export default function OrdersScreen ({ navigation }) {
  const [orders, setOrders] = useState([])
  const { loggedInUser } = useContext(AuthorizationContext)

  useEffect(() => {
    async function fetchOrders () {
      try {
        const fetchedOrders = await getIndexCustomer()
        setOrders(fetchedOrders)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving your orders. ${error} `,
          type: 'error',
          style: flashStyle,
          titleStyle: flashTextStyle
        })
      }
    }
    if (loggedInUser) {
      fetchOrders()
    } else {
      setOrders(null)
    }
  }, [loggedInUser])

  const renderOrders = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + item.restaurant.logo } : undefined}
        title={item.restaurant.name + ': ' + moment(item.createdAt).format('DD MMM YYYY - HH:mm')}
        onPress={() => {
          navigation.navigate('OrderDetailScreen', { id: item.id })
        }}
      >
        {item.createdAt !== null &&
          <TextSemiBold>Created at: <TextSemiBold textStyle={{ color: brandPrimary }}>{moment(item.createdAt).format('DD MMM YYYY - HH:mm')}</TextSemiBold></TextSemiBold>
        }
        {item.price !== null && item.restaurant.shippingCosts &&
        <TextSemiBold>Price: <TextSemiBold textStyle={{ color: brandPrimary }}>{item.price + '€ (Shipping costs: ' + item.restaurant.shippingCosts + '€)'}</TextSemiBold></TextSemiBold>
        }
      </ImageCard>
    )
  }

  const renderEmptyOrdersList = () => {
    if (!loggedInUser) {
      return (
      <View style={styles.text2}>
        <TextSemiBold>You need to be logged in to access your orders.</TextSemiBold>
      </View>
      )
    } else {
      return (
        <View style={styles.text2}>
        <TextSemiBold>You have no orders created.</TextSemiBold>
      </View>
      )
    }
  }

  return (
    <FlatList
      ListEmptyComponent={renderEmptyOrdersList}
      style={styles.container}
      data={orders}
      renderItem={renderOrders}
      keyExtractor={item => item.id.toString()} />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  text2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    margin: 12,
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
