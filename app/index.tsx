import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

// We will define an interface for the Pokemon object that we will be fetching from the API. This will help us to type our state variable and make sure that we are getting the correct data from the API.
interface Pokemon {
  name: string;
  url: string;
}

export default function Index() {
  // we will use the useState hook to store the list of pokemons in state. We will initialize it as undefined, and then set it to the data we get from the API when we fetch it.
  // pokemons is the actual value of the variable and setPokemons is the function that we will use to update the value of pokemons. We will call this function when we get the data from the API and want to store it in state.
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  
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
      const detailedPokemons = await Promise.all(
        data.results.map(async (pokemon: Pokemon) => {
          const res = await fetch(pokemon.url);
          const details = await res.json();
          return {
            name: pokemon.name,
            image: details.sprites.front_default, //main sprite of the pokemon
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
          <Text>{pokemon.name}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
