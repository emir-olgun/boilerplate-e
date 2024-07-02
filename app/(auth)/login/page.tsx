"use client";
import { loginWithMail, loginWithCardano, generateNonce, loginWithAsset } from "./loginActions";
import {
  signMessage,
  useWallet,
  WalletConnectButton,
  Asset,
} from "littlefish-nft-auth-framework/frontend";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Function to handle message signing for Cardano wallet
async function handleSign(
  walletID: string,
  isConnected: boolean,
  walletAddress: string
): Promise<[string, string] | void> {
  // Generate a nonce for the signing process
  const nonceResponse = await generateNonce();
  if (!nonceResponse) {
    console.error("Failed to generate nonce"); // Log error if nonce generation fails
    return;
  }

  const nonce = nonceResponse; // Store the generated nonce

  try {
    // Sign the nonce with the wallet
    const signResponse = await signMessage(
      walletID,
      isConnected,
      nonce,
      walletAddress
    );
    if (!signResponse) {
      console.error("Failed to sign message"); // Log error if message signing fails
      return;
    }
    const [key, signature] = signResponse; // Destructure key and signature from the response
    return [key, signature]; // Return the key and signature
  } catch (error) {
    console.error("Error signing message:", error); // Log any errors that occur during message signing
  }
}

// React component for the login page
export default function LoginPage() {
  const {
    isConnected,
    connectedWallet,
    networkID,
    addresses,
    assets,
    decodeHexToAscii,
  } = useWallet(); // Destructure wallet connection status and details
  const router = useRouter(); // Initialize router for navigation
  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const [success, setSuccess] = useState(false); // State for success status
  const [decodedAssets, setDecodedAssets] = useState<Asset[]>([]); // State for decoded assets
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (assets.length > 0) {
      setDecodedAssets(decodeHexToAscii(assets));
    }
  }, [isConnected]);

  // Function to handle login with Cardano wallet
  async function handleCardanoLogin(asset?: Asset) {
    if (connectedWallet) {
      try {
        // Sign the message using the wallet
        const signResponse = await handleSign(
          connectedWallet.name,
          isConnected,
          addresses[0]
        );
        if (signResponse) {
          const [key, signature] = signResponse; // Destructure key and signature from the response
          // Perform login with the Cardano wallet details
          let result;
          if (asset) {
            result = await loginWithAsset(
              addresses[0],
              networkID,
              key,
              signature,
              asset
            );
          } else {
            result = await loginWithCardano(
              addresses[0],
              networkID,
              key,
              signature
            );
          }
          if (result) {
            setSuccess(true); // Set success status to true
            setErrorMessage(""); // Clear error message
            console.log("result", result);
            router.push("/"); // Navigate to assets page
          } else {
            setErrorMessage(result || "Login failed"); // Set error message if login fails
            setSuccess(false); // Set success status to false
          }
        }
      } catch (error) {
        console.error("Failed to handle Cardano login:", error); // Log any errors that occur during Cardano login
        setErrorMessage("Failed to handle Cardano login"); // Set error message for Cardano login failure
        setSuccess(false); // Set success status to false
      }
    }
  }

  // Function to handle login with email and password
  async function handleEmailLogin() {
    try {
      // Perform login with email and password
      const result = await loginWithMail(email, password);
      if (result.success) {
        setSuccess(true); // Set success status to true
        setErrorMessage(""); // Clear error message
        router.push("/assets"); // Navigate to assets page
      } else {
        setErrorMessage(result.error || "Login failed"); // Set error message if login fails
        setSuccess(false); // Set success status to false
      }
    } catch (error) {
      console.error("Email login failed:", error); // Log any errors that occur during email login
      setErrorMessage("Email login failed"); // Set error message for email login failure
      setSuccess(false); // Set success status to false
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <WalletConnectButton onAssetSelect={handleCardanoLogin} />
      <form className="w-full max-w-sm p-4 bg-gray-800 rounded shadow-md">
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>
      <button
        onClick={handleEmailLogin}
        className="w-full max-w-sm p-2 mt-4 font-semibold text-white bg-blue-500 rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Login with Email
      </button>
      {isConnected && (
        <>
          <div className="w-full max-w-sm mt-4 p-4 bg-gray-800 rounded shadow-md">
            <button
              onClick={() => handleCardanoLogin()}
              className="w-full p-2 mb-2 font-semibold text-white bg-green-500 rounded shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Login with Wallet
            </button>
          </div>
          {!isDropdownOpen ? (<div className="w-full max-w-sm mt-4 p-4 bg-gray-800 rounded shadow-md">
            <button className="w-full p-2 mb-2 font-semibold text-white bg-green-500 rounded shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500" onClick={() => setIsDropdownOpen(true)}>
              Login With Assets
            </button>
          </div>) : (
            <>
              {
                assets.length === 0 ? (<div>No Asset Found</div>) : (<div className="w-full max-w-sm mt-4 p-4 bg-gray-800 rounded shadow-md">
                  {decodedAssets.length === 0 ? (
                    <div>No Decoded Asset Found</div>
                  ) : (
                    <div className="w-full max-w-sm mt-4 p-4 bg-gray-800 rounded shadow-md">
                      {decodedAssets.map((asset, index) => (
                        <button
                          key={index}
                          onClick={() => handleCardanoLogin(assets[index] as Asset)}
                          className="w-full p-2 mb-2 font-semibold text-white bg-green-500 rounded shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          {asset.assetName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>)
              }
            </>

          )}

        </>
      )}
      {errorMessage && ( // Display error message if present
        <div className="w-full max-w-sm mt-4 p-2 bg-red-500 text-white text-center rounded">
          {errorMessage}
        </div>
      )}
      {success && ( // Display success message if login is successful
        <div className="w-full max-w-sm mt-4 p-2 bg-green-500 text-white text-center rounded">
          Login Successful
        </div>
      )}
    </div>
  );
}
