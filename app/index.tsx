import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

// We will define an interface for the Pokemon object that we will be fetching from the API. This will help us to type our state variable and make sure that we are getting the correct data from the API.
interface Pokemon {
  name: string;
  image: string;
  imageBack: string;
  types: PokemonType[];
}

// We will also define an interface for the PokemonType object that we will be fetching from the API. This will help us to type our state variable and make sure that we are getting the correct data from the API.
interface PokemonType {
  type: {
    name: string;
    url: string;
  }
}

export default function Index() {
  // we will use the useState hook to store the list of pokemons in state. We will initialize it as undefined, and then set it to the data we get from the API when we fetch it.
  // pokemons is the actual value of the variable and setPokemons is the function that we will use to update the value of pokemons. We will call this function when we get the data from the API and want to store it in state.
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);

  // we will use the useEffect hook to fetch the data from the API when the component mounts. This will allow us to run the code that fetches the data when the screen loads.
  // we will also use the useEffect hook to log the first pokemon in the list to the console, so we can see what data we are getting from the API.
  console.log(JSON.stringify(pokemons[0], null, 2));
  
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
        "https://pokeapi.co/api/v2/pokemon/?limit=10"
      );

      // once we get a response, its going to come in a JSON format
      //so we can abstract the data and get the results property which is an array of pokemons (by using await).
      const data = await response.json();

      // we will use Promise.all to fetch the details of each pokemon in parallel. This will allow us to get the details of all pokemons at once, instead of waiting for each one to finish before starting the next one.
      const detailedPokemons = await Promise.any(
        data.results.map(async (pokemon: Pokemon) => {
          const res = await fetch(pokemon.image);
          const details = await res.json();
          return {
            name: pokemon.name,
            image: details.sprites.front_default, //main sprite of the pokemon
            imageBack: details.sprites.back_default, //back sprite of the pokemon
            types: details.types //array of types of the pokemon
          };
        })
      );

      console.log("Detailed Pokemons: ", detailedPokemons);

      setPokemons(data.results);
    } catch(e) {
      console.log("Error fetching pokemons: ", e);
    }
  }
  
  return (
    <ScrollView>
      {pokemons.map((pokemon) => (
        <View key={pokemon.name}>
          <Text style={styles.name}>{pokemon.name}</Text>
          <Text style={styles.type}>{pokemon.types[0].type.name}</Text>
          <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          }}
          >

            <Image
          source={{uri: pokemon.image}}
          style={{ width: 150, height: 150 }}
          />
          <Image
          source={{uri: pokemon.imageBack}}
          style={{ width: 150, height: 150 }}
          />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

//This takes an object of styles and you then start defining your styles. You can then use these styles in your components by referencing the style object 
// and the name of the style you want to use. For ex., if you have a style called container, you can use it in your component like this: style={styles.container}.
const styles = StyleSheet.create({
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  type: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'grey',
  },
});