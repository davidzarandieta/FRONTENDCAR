/* eslint-disable react/prop-types */
import React, { useEffect, useState, useContext } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image, Pressable, ScrollView } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { getDetail } from '../../api/RestaurantEndpoints'
import { createOrder } from '../../api/OrderEndpoints'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import { brandPrimary, brandPrimaryTap, brandSecondary, flashStyle, flashTextStyle } from '../../styles/GlobalStyles'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import * as yup from 'yup'
import InputItem from '../../components/InputItem'
import { ErrorMessage, Formik, FieldArray } from 'formik'
import TextError from '../../components/TextError'

export default function RestaurantDetailScreen ({ navigation, route }) {
  const [restaurant, setRestaurant] = useState({})
  const { loggedInUser } = useContext(AuthorizationContext)
  const [backendErrors, setBackendErrors] = useState()
  const initialOrderValues = { restaurantId: '', address: '', products: [] }

  const validationSchema = yup.object().shape({
    address: yup
      .string()
      .max(75, 'Address too long')
      .required('Address is required'),
    products: yup
      .array().of(
        yup.object().shape({
          quantity: yup
            .number()
            .optional()
            .max(100, 'You can\'t order more than 100 units of one single product')
            .min(0, 'You can\'t have negative quantities')
        })
      )
  })

  useEffect(() => {
    async function fetchRestaurantDetail () {
      try {
        const fetchedRestaurant = await getDetail(route.params.id)
        setRestaurant(fetchedRestaurant)
        initialOrderValues.restaurantId = fetchedRestaurant.id
        const orderLines = fetchedRestaurant.products.map(p => { return { productId: p.id, quantity: 0 } })
        initialOrderValues.products = orderLines
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving the restaurant's details. ${error} `,
          type: 'error',
          style: flashStyle,
          titleStyle: flashTextStyle
        })
      }
    }
    fetchRestaurantDetail()
  }, [route])

  const createOrderConst = async (values) => {
    setBackendErrors([])
    try {
      const filteredProducts = values.products.filter((v) => v.quantity > 0)
      values.products = filteredProducts
      console.log(values)
      const createdOrder = await createOrder(values)
      showMessage({
        message: `Order ${createdOrder.id} succesfully created`,
        type: 'success',
        style: flashStyle,
        titleStyle: flashTextStyle
      })
      navigation.navigate('RestaurantsScreen', { dirty: true })
    } catch (error) {
      console.log(error)
      setBackendErrors(error.errors)
    }
  }

  const renderHeader = () => {
    return (
        <ImageBackground source={(restaurant?.heroImage) ? { uri: process.env.API_BASE_URL + '/' + restaurant.heroImage, cache: 'force-cache' } : undefined} style={styles.imageBackground}>
          <View style={styles.restaurantHeaderContainer}>
            <TextSemiBold textStyle={styles.textTitle}>{restaurant.name}</TextSemiBold>
            <Image style={styles.image} source={restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : undefined} />
            <TextRegular textStyle={styles.description}>{restaurant.description}</TextRegular>
            <TextRegular textStyle={styles.description}>{restaurant.restaurantCategory ? restaurant.restaurantCategory.name : ''}</TextRegular>
          </View>
        </ImageBackground>
    )
  }

  const renderProduct = (item) => {
    return (
      <ImageCard
        imageUri={item.item.image ? { uri: process.env.API_BASE_URL + '/' + item.item.image } : undefined}
        title={item.item.name}
      >
        <TextRegular numberOfLines={2}>{item.item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.item.price.toFixed(2)}€</TextSemiBold>
          {loggedInUser &&
          <View style={{ alignItems: 'center' }}>
              <View style={{ width: '60%' }}>
                <InputItem
                  name={`products.${item.index}.quantity`}
                  label={'Quantity:'}
                />
              </View>
            </View>}
      </ImageCard>
    )
  }

  const renderEmptyProductsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        This restaurant has no products yet.
      </TextRegular>
    )
  }

  return (
        <Formik
        validationSchema={validationSchema}
        initialValues={initialOrderValues}
        onSubmit={createOrderConst}>
        {({ handleSubmit, setFieldValue, values }) => (
          <ScrollView>
                <FieldArray
                name={'products'}
                render={() => {
                  return (<FlatList
                  ListHeaderComponent={renderHeader}
                  ListEmptyComponent={renderEmptyProductsList}
                  style={styles.container}
                  data={restaurant.products}
                  renderItem={renderProduct}
                  keyExtractor={item => item.id.toString()}
                />)
                }}>
                </FieldArray>
            {loggedInUser && <View style={{ alignItems: 'center' }}>
              <View style={{ width: '60%' }}>
                <InputItem
                  name='address'
                  label='Address:'
                />
              {backendErrors && backendErrors.map((error, index) => <TextError key={index}>{error.msg}</TextError>) }
              <Pressable
                onPress={handleSubmit}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? brandPrimaryTap
                      : brandPrimary
                  },
                  styles.button
                ]}>
                <TextRegular textStyle={styles.text}>
                  Create order
                </TextRegular>
              </Pressable>
              </View>
            </View>}

        </ScrollView>
        )}</Formik>
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
    marginTop: 5,
    marginBottom: 5,
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
