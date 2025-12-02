import { Stack } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";



export default function Pok_Details() {
  // Get the search params from the URL
  // useLocalSearchParams is a hook that allows us to access the search params from the URL. This is useful for getting data that is passed in the URL, such as an ID or a name.
  const params = useLocalSearchParams();
  
  console.log(params.name);

  useEffect(() => {}, []);

  async function fetchPokemonDetails(name: string) {


  }

  return (
    <>
    <Stack.Screen options={{ title: params.name as string }} /> // Set the screen title to the pokemon name passed in the params
    <ScrollView
      contentContainerStyle={{
        gap: 16,
        padding: 16,
      }}>
    </ScrollView>
    </>
  );
}

//This takes an object of styles and you then start defining your styles. You can then use these styles in your components by referencing the style object 
// and the name of the style you want to use. For ex., if you have a style called container, you can use it in your component like this: style={styles.container}.
const styles = StyleSheet.create({
   
});