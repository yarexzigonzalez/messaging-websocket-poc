import React, { useState } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet } from "react-native";
import { useWebSocket } from "./useWebSocket";

const MY_ID = "alice";
const SERVER_URL = "ws://192.168.1.23:8000";

export default function ChatTestScreen() {
  const { connected, messages, sendMessage } = useWebSocket(MY_ID, SERVER_URL);
  const [recipient, setRecipient] = useState("bob");
  const [text, setText] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.status}>
        {connected ? `Connected as "${MY_ID}"` : "Connecting..."}
      </Text>

      <FlatList
        data={messages}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <Text style={styles.message}>
            <Text style={styles.sender}>{item.from}: </Text>
            {item.message}
          </Text>
        )}
        style={styles.list}
      />

      <TextInput
        style={styles.input}
        placeholder="Recipient id (e.g. bob)"
        value={recipient}
        onChangeText={setRecipient}
      />
      <TextInput
        style={styles.input}
        placeholder="Message"
        value={text}
        onChangeText={setText}
      />
      <Button
        title="Send"
        onPress={() => {
          sendMessage(recipient, text);
          setText("");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 60 },
  status: { marginBottom: 12, fontWeight: "600" },
  list: { flex: 1, marginBottom: 12 },
  message: { marginBottom: 6 },
  sender: { fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
});
