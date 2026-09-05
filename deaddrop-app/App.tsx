import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useWebSocket } from "./hooks/useWebSocket";

const SERVER_URL = "ws://192.168.0.101:8000";

const monospace = Platform.select({
  ios: "Courier",
  android: "monospace",
  default: "monospace",
});

export default function App() {
  const [myId, setMyId] = useState("");
  const [inputId, setInputId] = useState("");

  // Don't start the WebSocket until we actually have an ID.
  if (!myId) {
    return (
      <IdentityScreen
        inputId={inputId}
        setInputId={setInputId}
        onConnect={() => {
          const id = inputId.trim().toLowerCase();

          if (!id) return;

          setMyId(id);
        }}
      />
    );
  }

  return <ChatScreen myId={myId} />;
}

type IdentityScreenProps = {
  inputId: string;
  setInputId: (value: string) => void;
  onConnect: () => void;
};

function IdentityScreen({
  inputId,
  setInputId,
  onConnect,
}: IdentityScreenProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <View style={styles.identityContainer}>
        <Text style={styles.title}>DEADDROP</Text>

        <Text style={styles.subtitle}>
          realtime relay · websocket poc
        </Text>

        <Text style={styles.identityLabel}>WHO ARE YOU?</Text>

        <TextInput
          style={styles.input}
          placeholder="enter your ID"
          placeholderTextColor={DIM}
          value={inputId}
          onChangeText={setInputId}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={styles.connectButton}
          onPress={onConnect}
        >
          <Text style={styles.connectButtonText}>CONNECT</Text>
        </TouchableOpacity>

        <Text style={styles.helpText}>
          Use a different ID on each device.
          {"\n"}
          Example: alice on phone, bob in browser.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function ChatScreen({ myId }: { myId: string }) {
  const { connected, messages, sendMessage } = useWebSocket(
    myId,
    SERVER_URL
  );

  const [recipient, setRecipient] = useState("bob");
  const [text, setText] = useState("");

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.title}>DEADDROP</Text>

        <Text style={styles.subtitle}>
          realtime relay · websocket poc
        </Text>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.dot,
              connected ? styles.dotOn : styles.dotOff,
            ]}
          />

          <Text style={styles.statusText}>
            {connected
              ? `online as ${myId}`
              : "connecting..."}
          </Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const mine = item.from === myId;

          return (
            <View
              style={[
                styles.bubbleRow,
                mine && styles.bubbleRowMine,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  mine
                    ? styles.bubbleMine
                    : styles.bubbleTheirs,
                ]}
              >
                <Text style={styles.sender}>
                  {item.from}
                </Text>

                <Text style={styles.messageText}>
                  {item.message}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="send to..."
          placeholderTextColor={DIM}
          value={recipient}
          onChangeText={setRecipient}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.messageRow}>
          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="message"
            placeholderTextColor={DIM}
            value={text}
            onChangeText={setText}
          />

          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => {
              if (!text.trim()) return;

              sendMessage(recipient, text);
              setText("");
            }}
          >
            <Text style={styles.sendButtonText}>SEND</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const BG = "#141210";
const PANEL = "#1D1A16";
const AMBER = "#D98B4A";
const RUST = "#8B3A2F";
const CREAM = "#EDE3D3";
const DIM = "#6B5F52";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  identityContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  identityLabel: {
    color: CREAM,
    fontFamily: monospace,
    fontSize: 12,
    marginTop: 40,
    marginBottom: 8,
    letterSpacing: 1,
  },

  helpText: {
    color: DIM,
    fontFamily: monospace,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 16,
  },

  connectButton: {
    backgroundColor: AMBER,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },

  connectButtonText: {
    color: BG,
    fontFamily: monospace,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 1,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2520",
  },

  title: {
    color: AMBER,
    fontFamily: monospace,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 4,
  },

  subtitle: {
    color: DIM,
    fontFamily: monospace,
    fontSize: 12,
    marginTop: 2,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },

  dotOn: {
    backgroundColor: AMBER,
  },

  dotOff: {
    backgroundColor: "#4A433A",
  },

  statusText: {
    color: CREAM,
    fontFamily: monospace,
    fontSize: 12,
  },

  list: {
    padding: 16,
    flexGrow: 1,
  },

  bubbleRow: {
    marginBottom: 10,
    alignItems: "flex-start",
  },

  bubbleRowMine: {
    alignItems: "flex-end",
  },

  bubble: {
    maxWidth: "80%",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },

  bubbleTheirs: {
    backgroundColor: PANEL,
    borderColor: "#2A2520",
  },

  bubbleMine: {
    backgroundColor: "#2A1E16",
    borderColor: RUST,
  },

  sender: {
    color: AMBER,
    fontFamily: monospace,
    fontSize: 10,
    marginBottom: 2,
    textTransform: "lowercase",
  },

  messageText: {
    color: CREAM,
    fontFamily: monospace,
    fontSize: 14,
  },

  inputArea: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#2A2520",
    backgroundColor: PANEL,
  },

  input: {
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: "#2A2520",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: CREAM,
    fontFamily: monospace,
    marginBottom: 8,
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  messageInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },

  sendButton: {
    backgroundColor: AMBER,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  sendButtonText: {
    color: BG,
    fontFamily: monospace,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 1,
  },
});