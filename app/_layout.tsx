import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Home" 
        }}
      />

      <Stack.Screen 
        name="pok_details" 
        options={{ 
          title: "Pokemon Details", 
          headerBackButtonDisplayMode: "minimal",
          presentation: "formSheet", // Use formSheet presentation style which shows a modal-like screen
          sheetAllowedDetents: [0.3, 0.5, 0.7], // Define detents for the sheet for different heights
          sheetGrabberVisible: true, // Show grabber for better UX (indicates the screen can be swiped down)
        }}
      />
    </Stack>
  )
}
