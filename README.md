# SHIFTY Prototype

## Fixture Protocol and Adoption flow

### Transports

#### DNS-SD

All fixtures must advertise their presence using DNS-SD:

-   To be defined

#### Wired Ethernet

ToDo

#### WiFi

-   If fixtures cannot connect to a local network, they will create their own temporary network.
-   That SSID must follow the pattern `[MANUFACTURER]_[FIXTURE_TYPE]_[FIXTURE_UID]_SCF`
    -   Example: `ChinaLED_Wash1000_001_SCF`
    -   `[MANUFACTURER]` and `[FIXTURE_TYPE]` must use characters from the following set: `[A-Za-z0-9-]`
    -   `[FIXTURE_UID]` must be a unique identifier for the fixture, probably a (truncated) serial number
    -   `SCF` stands for SHIFTY Compatible Fixture
    -   The WiFi may be open or password protected
-   When connected, the fixture must accept TCP connections at port 4284 and speak the SHIFTY protocol (see below)

### SHIFTY Protocol

-   Every integer is encoded in little-endian format
-   TCP connection on port 4284
-   Packets are combined of a packet length (int32LE) followed by a protobuf message. The length is just the length of the protobuf, not including the length int itself. Therefore, the whole packet is [length] + 4 bytes long.
