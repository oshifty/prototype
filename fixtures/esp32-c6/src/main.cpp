/* Blink Example

   This example code is in the Public Domain (or CC0 licensed, at your option.)

   Unless required by applicable law or agreed to in writing, this
   software is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
   CONDITIONS OF ANY KIND, either express or implied.
*/
#include <lwip/netdb.h>
#include <pb_decode.h>
#include <pb_encode.h>
#include <stdio.h>
#include <string.h>

#include <string>

#include "driver/gpio.h"
#include "env.h"
#include "esp_event.h"
#include "esp_log.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "fixture.pb.h"
#include "freertos/FreeRTOS.h"
#include "freertos/event_groups.h"
#include "freertos/task.h"
#include "led_strip.h"
#include "lwip/err.h"
#include "lwip/sockets.h"
#include "lwip/sys.h"
#include "mdns.h"
#include "nvs_flash.h"
#include "sdkconfig.h"

#define PORT 4284
#define KEEPALIVE_IDLE 7200
#define KEEPALIVE_INTERVAL 75
#define KEEPALIVE_COUNT 9

uint8_t red = 16;
uint8_t green = 0;
uint8_t blue = 0;

static led_strip_handle_t led_strip;

static const char *TAG = "example";

/* The examples use WiFi configuration that you can set via project configuration menu

   If you'd rather not, just change the below entries to strings with
   the config you want - ie #define EXAMPLE_WIFI_SSID "mywifissid"
*/

#define EXAMPLE_ESP_WIFI_SSID CONFIG_ESP_WIFI_SSID
#define EXAMPLE_ESP_WIFI_PASS CONFIG_ESP_WIFI_PASSWORD
#define EXAMPLE_ESP_MAXIMUM_RETRY CONFIG_ESP_MAXIMUM_RETRY

#if CONFIG_ESP_WPA3_SAE_PWE_HUNT_AND_PECK
#define ESP_WIFI_SAE_MODE WPA3_SAE_PWE_HUNT_AND_PECK
#define EXAMPLE_H2E_IDENTIFIER ""
#elif CONFIG_ESP_WPA3_SAE_PWE_HASH_TO_ELEMENT
#define ESP_WIFI_SAE_MODE WPA3_SAE_PWE_HASH_TO_ELEMENT
#define EXAMPLE_H2E_IDENTIFIER CONFIG_ESP_WIFI_PW_ID
#elif CONFIG_ESP_WPA3_SAE_PWE_BOTH
#define ESP_WIFI_SAE_MODE WPA3_SAE_PWE_BOTH
#define EXAMPLE_H2E_IDENTIFIER CONFIG_ESP_WIFI_PW_ID
#endif
#if CONFIG_ESP_WIFI_AUTH_OPEN
#define ESP_WIFI_SCAN_AUTH_MODE_THRESHOLD WIFI_AUTH_OPEN
#elif CONFIG_ESP_WIFI_AUTH_WEP
#define ESP_WIFI_SCAN_AUTH_MODE_THRESHOLD WIFI_AUTH_WEP
#elif CONFIG_ESP_WIFI_AUTH_WPA_PSK
#define ESP_WIFI_SCAN_AUTH_MODE_THRESHOLD WIFI_AUTH_WPA_PSK
#elif CONFIG_ESP_WIFI_AUTH_WPA2_PSK
#define ESP_WIFI_SCAN_AUTH_MODE_THRESHOLD WIFI_AUTH_WPA2_PSK
#elif CONFIG_ESP_WIFI_AUTH_WPA_WPA2_PSK
#define ESP_WIFI_SCAN_AUTH_MODE_THRESHOLD WIFI_AUTH_WPA_WPA2_PSK
#elif CONFIG_ESP_WIFI_AUTH_WPA3_PSK
#define ESP_WIFI_SCAN_AUTH_MODE_THRESHOLD WIFI_AUTH_WPA3_PSK
#elif CONFIG_ESP_WIFI_AUTH_WPA2_WPA3_PSK
#define ESP_WIFI_SCAN_AUTH_MODE_THRESHOLD WIFI_AUTH_WPA2_WPA3_PSK
#elif CONFIG_ESP_WIFI_AUTH_WAPI_PSK
#define ESP_WIFI_SCAN_AUTH_MODE_THRESHOLD WIFI_AUTH_WAPI_PSK
#endif

/* FreeRTOS event group to signal when we are connected*/
static EventGroupHandle_t s_wifi_event_group;

/* The event group allows multiple bits for each event, but we only care about two events:
 * - we are connected to the AP with an IP
 * - we failed to connect after the maximum amount of retries */
#define WIFI_CONNECTED_BIT BIT0
#define WIFI_FAIL_BIT BIT1

static int s_retry_num = 0;

static void event_handler(void *arg, esp_event_base_t event_base,
                          int32_t event_id, void *event_data) {
    if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START) {
        esp_wifi_connect();
    } else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_DISCONNECTED) {
        if (s_retry_num < EXAMPLE_ESP_MAXIMUM_RETRY) {
            esp_wifi_connect();
            s_retry_num++;
            ESP_LOGI(TAG, "retry to connect to the AP");
        } else {
            xEventGroupSetBits(s_wifi_event_group, WIFI_FAIL_BIT);
        }
        ESP_LOGI(TAG, "connect to the AP fail");
    } else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP) {
        ip_event_got_ip_t *event = (ip_event_got_ip_t *)event_data;
        ESP_LOGI(TAG, "got ip:" IPSTR, IP2STR(&event->ip_info.ip));
        s_retry_num = 0;
        xEventGroupSetBits(s_wifi_event_group, WIFI_CONNECTED_BIT);
    }
}

void wifi_init_sta(void) {
    s_wifi_event_group = xEventGroupCreate();

    ESP_ERROR_CHECK(esp_netif_init());

    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_netif_create_default_wifi_sta();

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    esp_event_handler_instance_t instance_any_id;
    esp_event_handler_instance_t instance_got_ip;
    ESP_ERROR_CHECK(esp_event_handler_instance_register(WIFI_EVENT,
                                                        ESP_EVENT_ANY_ID,
                                                        &event_handler,
                                                        NULL,
                                                        &instance_any_id));
    ESP_ERROR_CHECK(esp_event_handler_instance_register(IP_EVENT,
                                                        IP_EVENT_STA_GOT_IP,
                                                        &event_handler,
                                                        NULL,
                                                        &instance_got_ip));

    wifi_config_t wifi_config = {
        .sta = {
            .ssid = EXAMPLE_ESP_WIFI_SSID,
            .password = EXAMPLE_ESP_WIFI_PASS,
            /* Authmode threshold resets to WPA2 as default if password matches WPA2 standards (password len => 8).
             * If you want to connect the device to deprecated WEP/WPA networks, Please set the threshold value
             * to WIFI_AUTH_WEP/WIFI_AUTH_WPA_PSK and set the password with length and format matching to
             * WIFI_AUTH_WEP/WIFI_AUTH_WPA_PSK standards.
             */
            .threshold = {
                .authmode = ESP_WIFI_SCAN_AUTH_MODE_THRESHOLD},
            // .sae_pwe_h2e = ESP_WIFI_SAE_MODE,
            // .sae_h2e_identifier = EXAMPLE_H2E_IDENTIFIER,
        },
    };
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config));
    ESP_ERROR_CHECK(esp_wifi_start());

    ESP_LOGI(TAG, "wifi_init_sta finished.");

    /* Waiting until either the connection is established (WIFI_CONNECTED_BIT) or connection failed for the maximum
     * number of re-tries (WIFI_FAIL_BIT). The bits are set by event_handler() (see above) */
    EventBits_t bits = xEventGroupWaitBits(s_wifi_event_group,
                                           WIFI_CONNECTED_BIT | WIFI_FAIL_BIT,
                                           pdFALSE,
                                           pdFALSE,
                                           portMAX_DELAY);

    /* xEventGroupWaitBits() returns the bits before the call returned, hence we can test which event actually
     * happened. */
    if (bits & WIFI_CONNECTED_BIT) {
        ESP_LOGI(TAG, "connected to ap SSID:%s password:%s",
                 EXAMPLE_ESP_WIFI_SSID, EXAMPLE_ESP_WIFI_PASS);
    } else if (bits & WIFI_FAIL_BIT) {
        ESP_LOGI(TAG, "Failed to connect to SSID:%s, password:%s",
                 EXAMPLE_ESP_WIFI_SSID, EXAMPLE_ESP_WIFI_PASS);
    } else {
        ESP_LOGE(TAG, "UNEXPECTED EVENT");
    }
}

int32_t map(int32_t x, int32_t in_min, int32_t in_max, int32_t out_min, int32_t out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

void start_mdns_service() {
    // initialize mDNS service
    esp_err_t err = mdns_init();
    if (err) {
        printf("MDNS Init failed: %d\n", err);
        return;
    }

    // set hostname
    mdns_hostname_set("espresif-esp32-c6");
    // set default instance
    mdns_instance_name_set("Espresif ESP32-C6");
}

void add_mdns_services() {
    // add our services
    mdns_service_add(NULL, "_scf", "_tcp", PORT, NULL, 0);

    // NOTE: services must be added before their properties can be set
    // use custom instance for the web server
    mdns_service_instance_name_set("_scf", "_tcp", "Espresif ESP32-C6");

    mdns_txt_item_t serviceTxtData[4] = {
        {"manufacturer", "Espresif"},
        {"model", "ESP32-C6"},
        {"version", "0.0.1"},
        {"serial", "123-456-789"}};

    // set txt data for service (will free and replace current data)
    mdns_service_txt_set("_scf", "_tcp", serviceTxtData, 4);
}

void sendHandshakeResponse(int sock) {
    ResponseMessage response = ResponseMessage_init_zero;

    uint8_t buffer[FIXTURE_PB_H_MAX_SIZE];

    pb_ostream_t stream = pb_ostream_from_buffer(buffer, sizeof(buffer));

    response.which_response = ResponseMessage_handshake_tag;
    response.response.handshake.success = true;

    if (!pb_encode(&stream, ResponseMessage_fields, &response)) {
        ESP_LOGE(TAG, "Error encoding protobuf message: %s", PB_GET_ERROR(&stream));
        return;
    }

    // send 4 bytes of message length
    uint8_t len[4];
    len[0] = stream.bytes_written & 0xFF;
    len[1] = (stream.bytes_written >> 8) & 0xFF;
    len[2] = (stream.bytes_written >> 16) & 0xFF;
    len[3] = (stream.bytes_written >> 24) & 0xFF;

    send(sock, len, sizeof(len), 0);

    // send message
    send(sock, buffer, stream.bytes_written, 0);

    ESP_LOGI(TAG, "Sent handshake response");
}

void sendInfoResponse(int sock) {
    ResponseMessage response = ResponseMessage_init_zero;

    uint8_t buffer[FIXTURE_PB_H_MAX_SIZE];

    pb_ostream_t stream = pb_ostream_from_buffer(buffer, sizeof(buffer));

    response.which_response = ResponseMessage_info_tag;
    strcpy(response.response.info.manufacturer, "Espressif");
    strcpy(response.response.info.model, "ESP32-C6");
    strcpy(response.response.info.serialNumber, "123-456-789");
    response.response.info.firmwareVersion.major = 0;
    response.response.info.firmwareVersion.minor = 0;
    response.response.info.firmwareVersion.patch = 1;

    if (!pb_encode(&stream, ResponseMessage_fields, &response)) {
        ESP_LOGE(TAG, "Error encoding protobuf message: %s", PB_GET_ERROR(&stream));
        return;
    }

    // send 4 bytes of message length
    uint8_t len[4];
    len[0] = stream.bytes_written & 0xFF;
    len[1] = (stream.bytes_written >> 8) & 0xFF;
    len[2] = (stream.bytes_written >> 16) & 0xFF;
    len[3] = (stream.bytes_written >> 24) & 0xFF;

    send(sock, len, sizeof(len), 0);

    // send message
    send(sock, buffer, stream.bytes_written, 0);

    ESP_LOGI(TAG, "Sent info response");
}

void sendFixtureDefinition(int sock) {
    std::string fixtureDefinition = "{\"emitters\":[{\"name\":\"LED\",\"type\":\"light\",\"attributes\":{\"1\":{\"name\":\"Red\",\"type\":\"int\"},\"2\":{\"name\":\"Green\",\"type\":\"int\"},\"3\":{\"name\":\"Blue\",\"type\":\"int\"}}}]}";

    ResponseMessage response = ResponseMessage_init_zero;

    uint8_t buffer[FIXTURE_PB_H_MAX_SIZE];

    pb_ostream_t stream = pb_ostream_from_buffer(buffer, sizeof(buffer));

    response.which_response = ResponseMessage_fixtureDefinition_tag;

    if (!pb_encode(&stream, ResponseMessage_fields, &response)) {
        ESP_LOGE(TAG, "Error encoding protobuf message: %s", PB_GET_ERROR(&stream));
        return;
    }

    // send 4 bytes of message length
    uint8_t len[4];
    len[0] = stream.bytes_written & 0xFF;
    len[1] = (stream.bytes_written >> 8) & 0xFF;
    len[2] = (stream.bytes_written >> 16) & 0xFF;
    len[3] = (stream.bytes_written >> 24) & 0xFF;

    send(sock, len, sizeof(len), 0);

    // send message
    send(sock, buffer, stream.bytes_written, 0);

    ESP_LOGI(TAG, "Sent fixture definition response");

    // send length of fixture definition
    uint8_t lenFixture[4];
    lenFixture[0] = fixtureDefinition.length() & 0xFF;
    lenFixture[1] = (fixtureDefinition.length() >> 8) & 0xFF;
    lenFixture[2] = (fixtureDefinition.length() >> 16) & 0xFF;
    lenFixture[3] = (fixtureDefinition.length() >> 24) & 0xFF;

    send(sock, lenFixture, sizeof(lenFixture), 0);

    // send fixture definition
    send(sock, fixtureDefinition.c_str(), fixtureDefinition.length(), 0);

    ESP_LOGI(TAG, "Sent fixture definition");
}

int32_t mapTo32Bit(uint8_t number) {
    return map(number, 0, 255, 0, 255);
}

uint8_t mapTo8Bit(int32_t number) {
    return map(number, 0, 255, 0, 255);
}

void sendAllAttributeValues(int sock) {
    ResponseMessage response = ResponseMessage_init_zero;

    uint8_t buffer[FIXTURE_PB_H_MAX_SIZE];

    pb_ostream_t stream = pb_ostream_from_buffer(buffer, sizeof(buffer));

    response.which_response = ResponseMessage_attributeValues_tag;
    response.response.attributeValues.data_count = 3;
    response.response.attributeValues.data[0].attributeId = 1;
    response.response.attributeValues.data[0].which_value = AttributeValue_intValue_tag;
    response.response.attributeValues.data[0].value.intValue = mapTo32Bit(red);
    response.response.attributeValues.data[1].attributeId = 2;
    response.response.attributeValues.data[1].which_value = AttributeValue_intValue_tag;
    response.response.attributeValues.data[1].value.intValue = mapTo32Bit(green);
    response.response.attributeValues.data[2].attributeId = 3;
    response.response.attributeValues.data[2].which_value = AttributeValue_intValue_tag;
    response.response.attributeValues.data[2].value.intValue = mapTo32Bit(blue);

    if (!pb_encode(&stream, ResponseMessage_fields, &response)) {
        ESP_LOGE(TAG, "Error encoding protobuf message: %s", PB_GET_ERROR(&stream));
        return;
    }

    // send 4 bytes of message length
    uint8_t len[4];
    len[0] = stream.bytes_written & 0xFF;
    len[1] = (stream.bytes_written >> 8) & 0xFF;
    len[2] = (stream.bytes_written >> 16) & 0xFF;
    len[3] = (stream.bytes_written >> 24) & 0xFF;

    send(sock, len, sizeof(len), 0);

    // send message
    send(sock, buffer, stream.bytes_written, 0);

    ESP_LOGI(TAG, "Sent all attribute values");
}

void sendAttributeValue(int sock, int attributeId, int value) {
    ResponseMessage response = ResponseMessage_init_zero;

    uint8_t buffer[FIXTURE_PB_H_MAX_SIZE];

    pb_ostream_t stream = pb_ostream_from_buffer(buffer, sizeof(buffer));

    response.which_response = ResponseMessage_attributeValue_tag;
    response.response.attributeValue.attributeId = attributeId;
    response.response.attributeValue.which_value = AttributeValue_intValue_tag;
    response.response.attributeValue.value.intValue = mapTo32Bit(value);

    if (!pb_encode(&stream, ResponseMessage_fields, &response)) {
        ESP_LOGE(TAG, "Error encoding protobuf message: %s", PB_GET_ERROR(&stream));
        return;
    }

    // send 4 bytes of message length
    uint8_t len[4];
    len[0] = stream.bytes_written & 0xFF;
    len[1] = (stream.bytes_written >> 8) & 0xFF;
    len[2] = (stream.bytes_written >> 16) & 0xFF;
    len[3] = (stream.bytes_written >> 24) & 0xFF;

    send(sock, len, sizeof(len), 0);

    // send message
    send(sock, buffer, stream.bytes_written, 0);

    ESP_LOGI(TAG, "Sent attribute value");
}

void handleProtobufMessage(uint8_t *rx_buffer_msg, int len, int sock) {
    pb_istream_t stream = pb_istream_from_buffer(rx_buffer_msg, len);

    CommandMessage message = CommandMessage_init_zero;

    if (!pb_decode(&stream, CommandMessage_fields, &message)) {
        ESP_LOGE(TAG, "Error decoding protobuf message: %s", PB_GET_ERROR(&stream));
        return;
    }

    if (message.which_command == CommandMessage_handshake_tag) {
        ESP_LOGI(TAG, "Received handshake message");
        sendHandshakeResponse(sock);
    } else if (message.which_command == CommandMessage_getInfo_tag) {
        ESP_LOGI(TAG, "Received get info message");
        sendInfoResponse(sock);
    } else if (message.which_command == CommandMessage_getFixtureDefinition_tag) {
        ESP_LOGI(TAG, "Received get fixture definition message");
        sendFixtureDefinition(sock);
    } else if (message.which_command == CommandMessage_getAllAttributeValues_tag) {
        ESP_LOGI(TAG, "Received get all attribute values message");
        sendAllAttributeValues(sock);
    } else if (message.which_command == CommandMessage_getAttributeValue_tag) {
        ESP_LOGI(TAG, "Received get attribute value message");

        if (message.command.getAttributeValue.attributeId == 1) {
            sendAttributeValue(sock, 1, red);
        } else if (message.command.getAttributeValue.attributeId == 2) {
            sendAttributeValue(sock, 2, green);
        } else if (message.command.getAttributeValue.attributeId == 3) {
            sendAttributeValue(sock, 3, blue);
        }
    } else if (message.which_command == CommandMessage_setAttributeValue_tag) {
        ESP_LOGI(TAG, "Received set attribute value message");

        if (message.command.setAttributeValue.has_data) {
            if (message.command.setAttributeValue.data.which_value == AttributeValue_intValue_tag) {
                ESP_LOGI(TAG, "Attribute ID: %lx, Value: %lx", message.command.setAttributeValue.data.attributeId, message.command.setAttributeValue.data.value.intValue);
                if (message.command.setAttributeValue.data.attributeId == 1) {
                    red = mapTo8Bit(message.command.setAttributeValue.data.value.intValue);
                } else if (message.command.setAttributeValue.data.attributeId == 2) {
                    green = mapTo8Bit(message.command.setAttributeValue.data.value.intValue);
                } else if (message.command.setAttributeValue.data.attributeId == 3) {
                    blue = mapTo8Bit(message.command.setAttributeValue.data.value.intValue);
                }
                led_strip_set_pixel(led_strip, 0, red, green, blue);
                led_strip_refresh(led_strip);
            }
        }
    } else {
        ESP_LOGE(TAG, "Unknown message type");
    }
}

static void tcp_server_task(void *pvParameters) {
    char addr_str[128];
    int addr_family = (int)pvParameters;
    int ip_protocol = 0;
    int keepAlive = 1;
    int keepIdle = KEEPALIVE_IDLE;
    int keepInterval = KEEPALIVE_INTERVAL;
    int keepCount = KEEPALIVE_COUNT;
    struct sockaddr_storage dest_addr;

    if (addr_family == AF_INET) {
        struct sockaddr_in *dest_addr_ip4 = (struct sockaddr_in *)&dest_addr;
        dest_addr_ip4->sin_addr.s_addr = htonl(INADDR_ANY);
        dest_addr_ip4->sin_family = AF_INET;
        dest_addr_ip4->sin_port = htons(PORT);
        ip_protocol = IPPROTO_IP;
    }

    int listen_sock = socket(addr_family, SOCK_STREAM, ip_protocol);
    if (listen_sock < 0) {
        ESP_LOGE(TAG, "Unable to create socket: errno %d", errno);
        vTaskDelete(NULL);
        return;
    }
    int opt = 1;
    setsockopt(listen_sock, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    // Note that by default IPV6 binds to both protocols, it is must be disabled
    // if both protocols used at the same time (used in CI)
    setsockopt(listen_sock, IPPROTO_IPV6, IPV6_V6ONLY, &opt, sizeof(opt));

    ESP_LOGI(TAG, "Socket created");

    int err = bind(listen_sock, (struct sockaddr *)&dest_addr, sizeof(dest_addr));
    if (err != 0) {
        ESP_LOGE(TAG, "Socket unable to bind: errno %d", errno);
        ESP_LOGE(TAG, "IPPROTO: %d", addr_family);
        goto CLEAN_UP;
    }
    ESP_LOGI(TAG, "Socket bound, port %d", PORT);

    err = listen(listen_sock, 1);
    if (err != 0) {
        ESP_LOGE(TAG, "Error occurred during listen: errno %d", errno);
        goto CLEAN_UP;
    }

    while (1) {
        ESP_LOGI(TAG, "Socket listening");

        struct sockaddr_storage source_addr;  // Large enough for both IPv4 or IPv6
        socklen_t addr_len = sizeof(source_addr);
        int sock = accept(listen_sock, (struct sockaddr *)&source_addr, &addr_len);
        if (sock < 0) {
            ESP_LOGE(TAG, "Unable to accept connection: errno %d", errno);
            break;
        }

        // Set tcp keepalive option
        setsockopt(sock, SOL_SOCKET, SO_KEEPALIVE, &keepAlive, sizeof(int));
        setsockopt(sock, IPPROTO_TCP, TCP_KEEPIDLE, &keepIdle, sizeof(int));
        setsockopt(sock, IPPROTO_TCP, TCP_KEEPINTVL, &keepInterval, sizeof(int));
        setsockopt(sock, IPPROTO_TCP, TCP_KEEPCNT, &keepCount, sizeof(int));
        // Convert ip address to string
        if (source_addr.ss_family == PF_INET) {
            inet_ntoa_r(((struct sockaddr_in *)&source_addr)->sin_addr, addr_str, sizeof(addr_str) - 1);
        }

        ESP_LOGI(TAG, "Socket accepted ip address: %s", addr_str);

        while (1) {
            // receive protobuf message length
            char rx_buffer_len[4];
            int success = recv(sock, rx_buffer_len, sizeof(rx_buffer_len), 0);

            ESP_LOGI(TAG, "Received length: %d", success);
            ESP_LOG_BUFFER_HEXDUMP(TAG, rx_buffer_len, sizeof(rx_buffer_len), ESP_LOG_INFO);

            if (success < 0) {
                ESP_LOGE(TAG, "Error occurred during receiving: errno %d", errno);
                break;
            } else if (success == 0) {
                ESP_LOGW(TAG, "Connection closed");
                break;
            } else {
                int len = 0;
                len = (rx_buffer_len[3] << 24) | (rx_buffer_len[2] << 16) | (rx_buffer_len[1] << 8) | rx_buffer_len[0];

                if (len > 0) {
                    uint8_t rx_buffer_msg[len];
                    int success = recv(sock, rx_buffer_msg, sizeof(rx_buffer_msg), 0);

                    ESP_LOGI(TAG, "Received data %d", success);
                    ESP_LOG_BUFFER_HEXDUMP(TAG, rx_buffer_msg, sizeof(rx_buffer_msg), ESP_LOG_INFO);

                    if (success < 0) {
                        ESP_LOGE(TAG, "Error occurred during receiving: errno %d", errno);
                        break;
                    } else if (success == 0) {
                        ESP_LOGW(TAG, "Connection closed");
                        break;
                    } else {
                        ESP_LOGI(TAG, "Received %d bytes: %s", len, rx_buffer_msg);
                        handleProtobufMessage(rx_buffer_msg, len, sock);
                    }
                }
            }
        }

        shutdown(sock, 0);
        close(sock);
    }

CLEAN_UP:
    close(listen_sock);
    vTaskDelete(NULL);
}

/* Use project configuration menu (idf.py menuconfig) to choose the GPIO to blink,
   or you can edit the following line and set a number here.
*/
#define CONFIG_REFRESH_PERIOD 10
#define CONFIG_BLINK_GPIO GPIO_NUM_8
#define BLINK_GPIO GPIO_NUM_8
#define CONFIG_BLINK_LED_STRIP 1
#define CONFIG_BLINK_LED_STRIP_BACKEND_SPI 1

static uint8_t s_led_state = 0;

#ifdef CONFIG_BLINK_LED_STRIP

static void blink_led(void) {
    /* If the addressable LED is enabled */
    if (s_led_state) {
        /* Set the LED pixel using RGB from 0 (0%) to 255 (100%) for each color */
        led_strip_set_pixel(led_strip, 0, 16, 16, 16);
        /* Refresh the strip to send data */
        led_strip_refresh(led_strip);
    } else {
        /* Set all LED off to clear all pixels */
        led_strip_clear(led_strip);
    }
}

static void configure_led(void) {
    ESP_LOGI(TAG, "Example configured to blink addressable LED!");
    /* LED strip initialization with the GPIO and pixels number*/
    led_strip_config_t strip_config = {
        .strip_gpio_num = BLINK_GPIO,
        .max_leds = 1,  // at least one LED on board
    };
#if CONFIG_BLINK_LED_STRIP_BACKEND_RMT
    led_strip_rmt_config_t rmt_config = {
        .resolution_hz = 10 * 1000 * 1000,  // 10MHz
        .flags.with_dma = false,
    };
    ESP_ERROR_CHECK(led_strip_new_rmt_device(&strip_config, &rmt_config, &led_strip));
#elif CONFIG_BLINK_LED_STRIP_BACKEND_SPI
    led_strip_spi_config_t spi_config = {
        .spi_bus = SPI2_HOST,
        .flags = {
            .with_dma = true,
        }};
    ESP_ERROR_CHECK(led_strip_new_spi_device(&strip_config, &spi_config, &led_strip));
#else
#error "unsupported LED strip backend"
#endif
    /* Set all LED off to clear all pixels */
    led_strip_clear(led_strip);
}

#elif CONFIG_BLINK_LED_GPIO

static void blink_led(void) {
    /* Set the GPIO level according to the state (LOW or HIGH)*/
    gpio_set_level(BLINK_GPIO, s_led_state);
}

static void configure_led(void) {
    ESP_LOGI(TAG, "Example configured to blink GPIO LED!");
    gpio_reset_pin(BLINK_GPIO);
    /* Set the GPIO as a push/pull output */
    gpio_set_direction(BLINK_GPIO, GPIO_MODE_OUTPUT);
}

#else
#error "unsupported LED type"
#endif

extern "C" void app_main(void) {
    // Initialize NVS
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);
    ESP_ERROR_CHECK(esp_netif_init());

    ESP_LOGI(TAG, "ESP_WIFI_MODE_STA");
    wifi_init_sta();

    // ESP_ERROR_CHECK(esp_event_loop_create_default());

    start_mdns_service();
    add_mdns_services();

    xTaskCreate(tcp_server_task, "tcp_server", 4096, (void *)AF_INET, 5, NULL);

    /* Configure the peripheral according to the LED type */
    configure_led();

    while (1) {
        // ESP_LOGI(TAG, "Turning the LED %s!", s_led_state == true ? "ON" : "OFF");
        // blink_led();
        // /* Toggle the LED state */
        // s_led_state = !s_led_state;

        vTaskDelay(CONFIG_REFRESH_PERIOD / portTICK_PERIOD_MS);
    }
}