/**
 * XOR Collaborative Editor — C++ Algorithm & Data Structure Template
 * Multi-threaded room buffer synchronization & Bitwise bit manipulation routines.
 */

#include <iostream>
#include <vector>
#include <string>
#include <numeric>
#include <algorithm>
#include <iomanip>

class CollaborativeRoomManager {
private:
    std::string roomId;
    std::vector<std::string> activePeers;
    std::vector<int> documentBuffer;

public:
    CollaborativeRoomManager(const std::string& id, const std::string& host) 
        : roomId(id) {
        activePeers.push_back(host);
    }

    void addPeer(const std::string& peer) {
        if (std::find(activePeers.begin(), activePeers.end(), peer) == activePeers.end()) {
            activePeers.push_back(peer);
        }
    }

    // Classic XOR single-number algorithm: O(N) time, O(1) space
    int findSingleNumber(const std::vector<int>& numbers) const {
        int result = 0;
        for (int num : numbers) {
            result ^= num;
        }
        return result;
    }

    // Fast XOR Swap demonstration
    void fastXorSwap(int& a, int& b) const {
        if (&a == &b) return;
        a ^= b;
        b ^= a;
        a ^= b;
    }

    // Byte XOR parity check
    uint8_t computeParity(const std::string& text) const {
        uint8_t parity = 0;
        for (char c : text) {
            parity ^= static_cast<uint8_t>(c);
        }
        return parity;
    }

    void displayStatus() const {
        std::cout << "========================================\n";
        std::cout << "  🌸 XOR C++ Engine Session: " << roomId << "\n";
        std::cout << "  👥 Connected Peers (" << activePeers.size() << "):\n";
        for (const auto& peer : activePeers) {
            std::cout << "     - " << peer << "\n";
        }
        std::cout << "========================================\n";
    }
};

int main() {
    CollaborativeRoomManager room("xor-session-live", "Nidhi");
    room.addPeer("Alice");
    room.addPeer("Developer2");

    room.displayStatus();

    std::vector<int> dataset = {7, 3, 5, 4, 5, 3, 4};
    int unique = room.findSingleNumber(dataset);
    std::cout << "[*] Single non-paired element: " << unique << "\n";

    int x = 42, y = 137;
    std::cout << "[*] Before XOR Swap: x=" << x << ", y=" << y << "\n";
    room.fastXorSwap(x, y);
    std::cout << "[*] After XOR Swap:  x=" << x << ", y=" << y << "\n";

    std::string sample = "XOR Collaborative Live";
    std::cout << "[*] Parity Checksum: 0x" 
              << std::hex << std::uppercase 
              << static_cast<int>(room.computeParity(sample)) << "\n";

    return 0;
}
