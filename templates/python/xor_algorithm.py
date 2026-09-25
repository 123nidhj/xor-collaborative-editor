"""
XOR Collaborative Editor — Python Algorithm Template
Real-time collaborative mathematical utilities & bitwise cryptographic hashing.
"""

from typing import List, Tuple, Dict, Any
import hashlib
import time


class CollaborativeXORSession:
    """
    Simulates collaborative operational transform & bitwise XOR algorithms
    for synchronized pair-programming rooms.
    """

    def __init__(self, room_id: str, host_name: str) -> None:
        self.room_id: str = room_id
        self.host_name: str = host_name
        self.collaborators: List[str] = [host_name]
        self.history: List[Dict[str, Any]] = []

    def compute_xor_checksum(self, data: bytes) -> int:
        """Computes rolling bitwise XOR checksum of a byte buffer."""
        checksum = 0
        for byte in data:
            checksum ^= byte
        return checksum

    def bitwise_xor_cipher(self, message: str, key: str) -> str:
        """
        Symmetric XOR string obfuscation for private room payload transmission.
        """
        cipher_chars = []
        for i, char in enumerate(message):
            key_char = key[i % len(key)]
            cipher_chars.append(chr(ord(char) ^ ord(key_char)))
        return "".join(cipher_chars)

    def add_peer(self, peer_name: str) -> bool:
        """Registers a new peer in the collaborative editing room."""
        if peer_name not in self.collaborators:
            self.collaborators.append(peer_name)
            self.history.append({
                "action": "PEER_JOIN",
                "user": peer_name,
                "timestamp": time.time()
            })
            return True
        return False

    def get_room_summary(self) -> Dict[str, Any]:
        """Returns structured JSON summary of active room telemetry."""
        return {
            "roomId": self.room_id,
            "host": self.host_name,
            "activeUsersCount": len(self.collaborators),
            "users": self.collaborators,
            "totalRevisions": len(self.history)
        }


def find_unique_element(nums: List[int]) -> int:
    """
    Classic XOR property demonstration:
    x ^ x = 0, x ^ 0 = x
    Finds the single non-duplicate number in a list of pairs in O(N) time and O(1) space.
    """
    unique = 0
    for num in nums:
        unique ^= num
    return unique


if __name__ == "__main__":
    session = CollaborativeXORSession("xor-alpha-99", "Nidhi")
    session.add_peer("Alice")
    session.add_peer("Bob")

    test_data = [4, 1, 2, 1, 2, 4, 99]
    print(f"[*] XOR Single Element in {test_data}: {find_unique_element(test_data)}")

    secret = "XOR Live Collaborative Code 2026"
    key = "pink_theme_secret"
    encrypted = session.bitwise_xor_cipher(secret, key)
    decrypted = session.bitwise_xor_cipher(encrypted, key)

    print(f"[*] Original:  {secret}")
    print(f"[*] Decrypted: {decrypted}")
    print(f"[*] Room Status: {session.get_room_summary()}")
