package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"slices"
)

// Store for usernames
var usernames = []string{}

const registrationType = "m.login.registration_token"

var registrationToken = os.Getenv("MATRIX_REGISTRATION_TOKEN")

// Check if username exists in the list of usernames
func usernameAvailable(username string) bool {
	return !slices.Contains(usernames, username)
}

// Handle GET requests for username availability
func handleGetAvailable(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	username := r.URL.Query().Get("username")

	if username == "" {
		http.Error(w, "Username query parameter is required", http.StatusBadRequest)
		return
	}

	available := usernameAvailable(username)

	// Respond with JSON indicating whether the username is available
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]bool{"available": available})
}

// Handle POST requests for user registration
func handlePostRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	// Check if the registration token matches the env var
	if registrationToken == "" {
		http.Error(w, "MATRIX_REGISTRATION_TOKEN environment variable not set", http.StatusInternalServerError)
		return
	}

	var req struct {
		Auth struct {
			Type  string `json:"type"`
			Token string `json:"token"`
		} `json:"auth"`
		Username string `json:"username"`
		Password string `json:"password"`
	}

	// Decode the JSON body of the request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf("Error decoding request body: %s", err), http.StatusBadRequest)
		return
	}

	// Validate the registration token and username
	if req.Auth.Type != registrationType || req.Auth.Token != registrationToken || !usernameAvailable(req.Username) {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("{}")) // Empty JSON body
		return
	}

	// Add the username to the list
	usernames = append(usernames, req.Username)

	// Respond with success
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("{}")) // Empty JSON body
}

func main() {
	// Define routes
	http.HandleFunc("/_matrix/client/v3/register/available", handleGetAvailable)
	http.HandleFunc("/_matrix/client/v3/register", handlePostRegister)

	// Start the server
	port := ":8080"
	fmt.Printf("Server is running on port: %s\n", port)
	log.Fatal(http.ListenAndServe(port, nil))
}
