import { useEffect } from "react";
import { Text, View } from "react-native";

export default function Index() {
  
  //when i load the app, i want to fetch the list of pokemon from the pokeapi and store it in state. I will use react hooks to do this. 
  // I will use the useEffect hook to fetch the data when the component mount (allows us to run code when the screen mounts), and I will 
  // use the useState hook to store the data in state (allows us to save the data in a state variable that we can then display on screen).
  useEffect(() => {
    // fetch the list of pokemons from the pokeapi
    fetchPokemons();
  }, []);

  async function fetchPokemons() {
    try {
      // fetch is a function that allows us to hit an api. It takes an url as a parameter and then some request info (like method, headers, body, etc). It returns a response object that we can then parse to get the data we need.
      // It is a simple GET request
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon/?limit=20"
      );
      // once we get a response, its going to come in a JSON format
      //so we can abstract the data and get the results property which is an array of pokemons (by using await).
      const data = await response.json();

      console.log(data);
    } catch(e) {
      console.log("Error fetching pokemons: ", e);
    }
  }
  
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Pokémon Explorer</Text>
    </View>
  );
}
