"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

interface Policy {
    id: string;
    policyID: string;
    createdAt: string;
    updatedAt: string;
}

interface Identifiers {
    id: string;
    identifier: string;
    createdAt: string;
    updatedAt: string;
}

interface User {
    id: string;
    email: string;
    walletAddress: string;
    walletNetwork: number;
    createdAt: string;
    updatedAt: string;
    roles: string[];
}
export default function SettingsPage({ currentUserId }: { currentUserId: string }) {
    const [regularPolicy, setRegularPolicy] = useState<string>("");
    const [regularIdentifier, setRegularIdentifier] = useState<string>("");
    const [ssoPolicy, setSsoPolicy] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [identifiers, setIdentifiers] = useState<Identifiers[]>([]);
    const [SsoPolicies, setSsoPolicies] = useState<Policy[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [strictPolicy, setStrictPolicy] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        fetchPolicies();
        fetchSsoPolicies();
        fetchUsers();
        fetchSettings();
        fetchIdentifiers();
    }, []);

    async function fetchUsers() {
        try {
            const response = await fetch("/api/users");
            if (!response.ok) throw new Error("Failed to fetch users");
            const data: User[] = await response.json();
            setUsers(data);
        } catch (error) {
            setMessage("Error fetching users");
            console.error(error);
        }
    }

    async function deleteUser(userId: string) {
        if (!confirm("Are you sure you want to delete this user?")) {
            return;
        }

        try {
            const response = await fetch("/api/users", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: userId }),
            });
            if (!response.ok) throw new Error("Failed to delete user");
            const data = await response.json();
            setMessage(data.message);

            if (userId === currentUserId) {
                // If the deleted user is the current user, redirect to login
                router.push('/login');
            } else {
                // Otherwise, just refresh the users list
                fetchUsers();
            }
        } catch (error) {
            setMessage("Failed to delete user.");
            console.error(error);
        }
    }

    async function updateUserRole(userId: string) {
        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: userId }),
            });
            if (!response.ok) throw new Error("Failed to update user role");
            setMessage("User role updated successfully.");
            fetchUsers();
        } catch (error) {
            setMessage("Failed to update user role.");
            console.error(error);
        }
    }

    async function fetchSettings() {
        try {
            const response = await fetch("/api/setting");
            if (!response.ok) throw new Error("Failed to fetch settings");
            const data = await response.json();
            setStrictPolicy(data.strictPolicy);
        } catch (error) {
            console.error("Error fetching settings:", error);
            setStrictPolicy(false);
        }
    }

    async function updateSetting(strictPolicy: boolean) {
        try {
            const response = await fetch("/api/setting", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ strictPolicy }),
            });
            if (!response.ok) throw new Error("Failed to update setting");
            setMessage("Setting updated successfully.");
        } catch (error) {
            setMessage("Failed to update setting.");
            console.error(error);
        }
    }

    async function registerPolicy(policyID: string, endpoint: string) {
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ policyID }),
            });
            if (!response.ok) throw new Error(`Failed to register policy at ${endpoint}`);
            setMessage("Policy registered successfully.");
            if (endpoint === "/api/policy") fetchPolicies();
            if (endpoint === "/api/ssoPolicy") fetchSsoPolicies();
        } catch (error) {
            setMessage(`Failed to register policy at ${endpoint}.`);
            console.error(error);
        }
    }

    async function fetchPolicies() {
        try {
            const response = await fetch("/api/policy");
            if (!response.ok) throw new Error("Failed to fetch policies");
            const data: Policy[] = await response.json();
            setPolicies(data);
        } catch (error) {
            setMessage("Error fetching policies");
            console.error(error);
        }
    }

    async function registerIdentifier(identifier: string, endpoint: string) {
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier }),
            });
            if (!response.ok) throw new Error(`Failed to register identifier at ${endpoint}`);
            setMessage("identifier registered successfully.");
            if (endpoint === "/api/identifer") fetchIdentifiers();
        } catch (error) {
            setMessage(`Failed to register identifier at ${endpoint}.`);
            console.error(error);
        }
    }

    async function fetchIdentifiers() {
        try {
            const response = await fetch("/api/identifier");
            if (!response.ok) throw new Error("Failed to fetch identifiers");
            const data: Identifiers[] = await response.json();
            setIdentifiers(data);
        } catch (error) {
            setMessage("Error fetching Identifiers");
            console.error(error);
        }
    }

    async function fetchSsoPolicies() {
        try {
            const response = await fetch("/api/ssoPolicy");
            if (!response.ok) throw new Error("Failed to fetch policies");
            const data: Policy[] = await response.json();
            setSsoPolicies(data);
        } catch (error) {
            setMessage("Error fetching policies");
            console.error(error);
        }
    }

    const handleSubmitRegularPolicy = (e: React.FormEvent) => {
        e.preventDefault();
        registerPolicy(regularPolicy, "/api/policy");
        setRegularPolicy(""); // Clear the input after submission
    };

    const handleSubmitRegularIdentifier = (e: React.FormEvent) => {
        e.preventDefault();
        registerIdentifier(regularIdentifier, "/api/identifier");
        setRegularIdentifier(""); // Clear the input after submission
    };

    const handleSubmitSsoPolicy = (e: React.FormEvent) => {
        e.preventDefault();
        registerPolicy(ssoPolicy, "/api/ssoPolicy");
        setSsoPolicy(""); // Clear the input after submission
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStrictPolicy = e.target.checked;
        setStrictPolicy(newStrictPolicy);
        updateSetting(newStrictPolicy);
    };

    return (
        <div className="container mx-auto p-4 mt-16">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <p className="text-red-800 text-lg font-extrabold mb-2">This page is only accessible to users with the admin role.</p>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="strictPolicy">
                    Strict Policy
                </label>
                <input
                    type="checkbox"
                    id="strictPolicy"
                    className="mr-2 leading-tight"
                    checked={strictPolicy}
                    onChange={handleCheckboxChange}
                />
            </div>
            {message && <p className="text-red-500 text-xs italic mb-4">{message}</p>}

            <h1 className="text-2xl font-bold mb-4">Register New Policy</h1>
            <form onSubmit={handleSubmitRegularPolicy} className="w-full max-w-lg">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regularPolicyID">
                        Policy ID
                    </label>
                    <input
                        type="text"
                        id="regularPolicyID"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={regularPolicy}
                        onChange={(e) => setRegularPolicy(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Register
                    </button>
                </div>
            </form>

            <h1 className="text-2xl font-bold mb-4">Register New Identifier</h1>
            <form onSubmit={handleSubmitRegularIdentifier} className="w-full max-w-lg">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regularPolicyID">
                        Unique Identifier
                    </label>
                    <input
                        type="text"
                        id="regularPolicyID"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={regularIdentifier}
                        onChange={(e) => setRegularIdentifier(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Register
                    </button>
                </div>
            </form>

            <h1 className="text-2xl font-bold mb-4">Register New SSO Policy</h1>
            <form onSubmit={handleSubmitSsoPolicy} className="w-full max-w-lg">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ssoPolicyID">
                        Policy ID
                    </label>
                    <input
                        type="text"
                        id="ssoPolicyID"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={ssoPolicy}
                        onChange={(e) => setSsoPolicy(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Register
                    </button>
                </div>
            </form>

            <h2 className="text-xl font-bold mt-8">Policies List</h2>
            <ul>
                {policies.length > 0 ? (
                    policies.map((policy) => (
                        <li key={policy.id} className="border-b border-gray-200 py-2">
                            <p><strong>Policy ID:</strong> {policy.policyID}</p>
                            <p><strong>Created At:</strong> {new Date(policy.createdAt).toLocaleString()}</p>
                            <p><strong>Updated At:</strong> {new Date(policy.updatedAt).toLocaleString()}</p>
                        </li>
                    ))
                ) : (
                    <li>No policies found</li>
                )}
            </ul>

            <h2 className="text-xl font-bold mt-8">SSO Policies List</h2>
            <ul>
                {SsoPolicies.length > 0 ? (
                    SsoPolicies.map((policy) => (
                        <li key={policy.id} className="border-b border-gray-200 py-2">
                            <p><strong>Policy ID:</strong> {policy.policyID}</p>
                            <p><strong>Created At:</strong> {new Date(policy.createdAt).toLocaleString()}</p>
                            <p><strong>Updated At:</strong> {new Date(policy.updatedAt).toLocaleString()}</p>
                        </li>
                    ))
                ) : (
                    <li>No policies found</li>
                )}
            </ul>

            <h2 className="text-xl font-bold mt-8">Unique Identifiers List</h2>
            <ul>
                {identifiers.length > 0 ? (
                    identifiers.map((identifier) => (
                        <li key={identifier.id} className="border-b border-gray-200 py-2">
                            <p><strong>Unique Identifier:</strong> {identifier.identifier}</p>
                            <p><strong>Created At:</strong> {new Date(identifier.createdAt).toLocaleString()}</p>
                            <p><strong>Updated At:</strong> {new Date(identifier.updatedAt).toLocaleString()}</p>
                        </li>
                    ))
                ) : (
                    <li>No Identifiers found</li>
                )}
            </ul>

            <h2 className="text-xl font-bold mt-8">Users List</h2>
            <ul>
                {users.length > 0 ? (
                    users.map((user) => (
                        <li key={user.id} className="border-b border-gray-200 py-2">
                            {user.email && <p><strong>Email:</strong> {user.email}</p>}
                            {user.walletAddress && (
                                <>
                                    <p><strong>Wallet Address:</strong> {user.walletAddress}</p>
                                    <p><strong>Wallet Network:</strong> {user.walletNetwork}</p>
                                    <p><strong>Created At:</strong> {new Date(user.createdAt).toLocaleString()}</p>
                                    <p><strong>Updated At:</strong> {new Date(user.updatedAt).toLocaleString()}</p>
                                </>
                            )}
                            <p><strong>Role:</strong> {user.roles.join(", ")}</p>
                            <button
                                onClick={() => deleteUser(user.id)}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => updateUserRole(user.id)}
                                className={`${user.roles.includes("admin") ? "bg-purple-500 hover:bg-purple-700" : "bg-green-500 hover:bg-green-700"
                                    } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
                            >
                                {user.roles.includes("admin") ? "Remove Admin Role" : "Give Admin Role"}
                            </button>
                        </li>
                    ))
                ) : (
                    <li>No users found</li>
                )}
            </ul>
        </div>
    );
}