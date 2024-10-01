// @generated by protoc-gen-es v2.1.0 with parameter "target=ts"
// @generated from file fixture.proto (syntax proto3)
/* eslint-disable */

import type { GenEnum, GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { enumDesc, fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file fixture.proto.
 */
export const file_fixture: GenFile = /*@__PURE__*/
  fileDesc("Cg1maXh0dXJlLnByb3RvIr8HCg5Db21tYW5kTWVzc2FnZRIzCg1zZXRXaWZpQ29uZmlnGAEgASgLMhouQ29tbWFuZE1lc3NhZ2UuV2lmaUNvbmZpZ0gAEigKB2dldEluZm8YAiABKAsyFS5Db21tYW5kTWVzc2FnZS5FbXB0eUgAEioKCWdldFN0YXR1cxgDIAEoCzIVLkNvbW1hbmRNZXNzYWdlLkVtcHR5SAASKgoJaGFuZHNoYWtlGAQgASgLMhUuQ29tbWFuZE1lc3NhZ2UuRW1wdHlIABI1ChRnZXRGaXh0dXJlRGVmaW5pdGlvbhgFIAEoCzIVLkNvbW1hbmRNZXNzYWdlLkVtcHR5SAASPgoRZ2V0QXR0cmlidXRlVmFsdWUYBiABKAsyIS5Db21tYW5kTWVzc2FnZS5HZXRBdHRyaWJ1dGVWYWx1ZUgAEkAKEmdldEF0dHJpYnV0ZVZhbHVlcxgHIAEoCzIiLkNvbW1hbmRNZXNzYWdlLkdldEF0dHJpYnV0ZVZhbHVlc0gAEjYKFWdldEFsbEF0dHJpYnV0ZVZhbHVlcxgIIAEoCzIVLkNvbW1hbmRNZXNzYWdlLkVtcHR5SAASPgoRc2V0QXR0cmlidXRlVmFsdWUYCSABKAsyIS5Db21tYW5kTWVzc2FnZS5TZXRBdHRyaWJ1dGVWYWx1ZUgAEkAKEnNldEF0dHJpYnV0ZVZhbHVlcxgKIAEoCzIiLkNvbW1hbmRNZXNzYWdlLlNldEF0dHJpYnV0ZVZhbHVlc0gAGq8BCgpXaWZpQ29uZmlnEgwKBHNzaWQYASABKAkSEAoIcGFzc3dvcmQYAiABKAkSQQoOc3RhdGljSXBDb25maWcYAyABKAsyKS5Db21tYW5kTWVzc2FnZS5XaWZpQ29uZmlnLlN0YXRpY0lwQ29uZmlnGj4KDlN0YXRpY0lwQ29uZmlnEgoKAmlwGAEgASgJEg8KB2dhdGV3YXkYAiABKAkSDwoHbmV0bWFzaxgDIAEoCRoHCgVFbXB0eRooChFHZXRBdHRyaWJ1dGVWYWx1ZRITCgthdHRyaWJ1dGVJZBgBIAEoBRoqChJHZXRBdHRyaWJ1dGVWYWx1ZXMSFAoMYXR0cmlidXRlSWRzGAEgAygFGjIKEVNldEF0dHJpYnV0ZVZhbHVlEh0KBGRhdGEYASABKAsyDy5BdHRyaWJ1dGVWYWx1ZRozChJTZXRBdHRyaWJ1dGVWYWx1ZXMSHQoEZGF0YRgBIAMoCzIPLkF0dHJpYnV0ZVZhbHVlQgkKB2NvbW1hbmQi3wYKD1Jlc3BvbnNlTWVzc2FnZRI/ChFzZXRDb25maWdSZXNwb25zZRgBIAEoCzIiLlJlc3BvbnNlTWVzc2FnZS5TZXRDb25maWdSZXNwb25zZUgAEi0KBGluZm8YAiABKAsyHS5SZXNwb25zZU1lc3NhZ2UuSW5mb1Jlc3BvbnNlSAASMQoGc3RhdHVzGAMgASgLMh8uUmVzcG9uc2VNZXNzYWdlLlN0YXR1c1Jlc3BvbnNlSAASNwoJaGFuZHNoYWtlGAQgASgLMiIuUmVzcG9uc2VNZXNzYWdlLkhhbmRzaGFrZVJlc3BvbnNlSAASRwoRZml4dHVyZURlZmluaXRpb24YBSABKAsyKi5SZXNwb25zZU1lc3NhZ2UuRml4dHVyZURlZmluaXRpb25SZXNwb25zZUgAEikKDmF0dHJpYnV0ZVZhbHVlGAYgASgLMg8uQXR0cmlidXRlVmFsdWVIABI7Cg9hdHRyaWJ1dGVWYWx1ZXMYByABKAsyIC5SZXNwb25zZU1lc3NhZ2UuQXR0cmlidXRlVmFsdWVzSAAaJAoRU2V0Q29uZmlnUmVzcG9uc2USDwoHc3VjY2VzcxgBIAEoCBqNAQoMSW5mb1Jlc3BvbnNlEhQKDG1hbnVmYWN0dXJlchgBIAEoCRINCgVtb2RlbBgCIAEoCRIUCgxzZXJpYWxOdW1iZXIYAyABKAkSIAoPZmlybXdhcmVWZXJzaW9uGAQgASgLMgcuU2VtVmVyEiAKD2hhcmR3YXJlVmVyc2lvbhgFIAEoCzIHLlNlbVZlchp6Cg5TdGF0dXNSZXNwb25zZRI6CgZzdGF0dXMYASABKA4yKi5SZXNwb25zZU1lc3NhZ2UuU3RhdHVzUmVzcG9uc2UuU3RhdHVzQ29kZSIsCgpTdGF0dXNDb2RlEgYKAk9LEAASCwoHV0FSTklORxABEgkKBUVSUk9SEAIaJAoRSGFuZHNoYWtlUmVzcG9uc2USDwoHc3VjY2VzcxgBIAEoCBopChlGaXh0dXJlRGVmaW5pdGlvblJlc3BvbnNlEgwKBGpzb24YASABKAkaMAoPQXR0cmlidXRlVmFsdWVzEh0KBGRhdGEYASADKAsyDy5BdHRyaWJ1dGVWYWx1ZUIKCghyZXNwb25zZSJbCg5BdHRyaWJ1dGVWYWx1ZRITCgthdHRyaWJ1dGVJZBgBIAEoBRIUCgpmbG9hdFZhbHVlGAIgASgCSAASFQoLc3RyaW5nVmFsdWUYAyABKAlIAEIHCgV2YWx1ZSI1CgZTZW1WZXISDQoFbWFqb3IYASABKAUSDQoFbWlub3IYAiABKAUSDQoFcGF0Y2gYAyABKAViBnByb3RvMw");

/**
 * @generated from message CommandMessage
 */
export type CommandMessage = Message<"CommandMessage"> & {
  /**
   * @generated from oneof CommandMessage.command
   */
  command: {
    /**
     * @generated from field: CommandMessage.WifiConfig setWifiConfig = 1;
     */
    value: CommandMessage_WifiConfig;
    case: "setWifiConfig";
  } | {
    /**
     * @generated from field: CommandMessage.Empty getInfo = 2;
     */
    value: CommandMessage_Empty;
    case: "getInfo";
  } | {
    /**
     * @generated from field: CommandMessage.Empty getStatus = 3;
     */
    value: CommandMessage_Empty;
    case: "getStatus";
  } | {
    /**
     * @generated from field: CommandMessage.Empty handshake = 4;
     */
    value: CommandMessage_Empty;
    case: "handshake";
  } | {
    /**
     * @generated from field: CommandMessage.Empty getFixtureDefinition = 5;
     */
    value: CommandMessage_Empty;
    case: "getFixtureDefinition";
  } | {
    /**
     * @generated from field: CommandMessage.GetAttributeValue getAttributeValue = 6;
     */
    value: CommandMessage_GetAttributeValue;
    case: "getAttributeValue";
  } | {
    /**
     * @generated from field: CommandMessage.GetAttributeValues getAttributeValues = 7;
     */
    value: CommandMessage_GetAttributeValues;
    case: "getAttributeValues";
  } | {
    /**
     * @generated from field: CommandMessage.Empty getAllAttributeValues = 8;
     */
    value: CommandMessage_Empty;
    case: "getAllAttributeValues";
  } | {
    /**
     * @generated from field: CommandMessage.SetAttributeValue setAttributeValue = 9;
     */
    value: CommandMessage_SetAttributeValue;
    case: "setAttributeValue";
  } | {
    /**
     * @generated from field: CommandMessage.SetAttributeValues setAttributeValues = 10;
     */
    value: CommandMessage_SetAttributeValues;
    case: "setAttributeValues";
  } | { case: undefined; value?: undefined };
};

/**
 * Describes the message CommandMessage.
 * Use `create(CommandMessageSchema)` to create a new message.
 */
export const CommandMessageSchema: GenMessage<CommandMessage> = /*@__PURE__*/
  messageDesc(file_fixture, 0);

/**
 * @generated from message CommandMessage.WifiConfig
 */
export type CommandMessage_WifiConfig = Message<"CommandMessage.WifiConfig"> & {
  /**
   * @generated from field: string ssid = 1;
   */
  ssid: string;

  /**
   * @generated from field: string password = 2;
   */
  password: string;

  /**
   * @generated from field: CommandMessage.WifiConfig.StaticIpConfig staticIpConfig = 3;
   */
  staticIpConfig?: CommandMessage_WifiConfig_StaticIpConfig;
};

/**
 * Describes the message CommandMessage.WifiConfig.
 * Use `create(CommandMessage_WifiConfigSchema)` to create a new message.
 */
export const CommandMessage_WifiConfigSchema: GenMessage<CommandMessage_WifiConfig> = /*@__PURE__*/
  messageDesc(file_fixture, 0, 0);

/**
 * @generated from message CommandMessage.WifiConfig.StaticIpConfig
 */
export type CommandMessage_WifiConfig_StaticIpConfig = Message<"CommandMessage.WifiConfig.StaticIpConfig"> & {
  /**
   * @generated from field: string ip = 1;
   */
  ip: string;

  /**
   * @generated from field: string gateway = 2;
   */
  gateway: string;

  /**
   * @generated from field: string netmask = 3;
   */
  netmask: string;
};

/**
 * Describes the message CommandMessage.WifiConfig.StaticIpConfig.
 * Use `create(CommandMessage_WifiConfig_StaticIpConfigSchema)` to create a new message.
 */
export const CommandMessage_WifiConfig_StaticIpConfigSchema: GenMessage<CommandMessage_WifiConfig_StaticIpConfig> = /*@__PURE__*/
  messageDesc(file_fixture, 0, 0, 0);

/**
 * @generated from message CommandMessage.Empty
 */
export type CommandMessage_Empty = Message<"CommandMessage.Empty"> & {
};

/**
 * Describes the message CommandMessage.Empty.
 * Use `create(CommandMessage_EmptySchema)` to create a new message.
 */
export const CommandMessage_EmptySchema: GenMessage<CommandMessage_Empty> = /*@__PURE__*/
  messageDesc(file_fixture, 0, 1);

/**
 * @generated from message CommandMessage.GetAttributeValue
 */
export type CommandMessage_GetAttributeValue = Message<"CommandMessage.GetAttributeValue"> & {
  /**
   * @generated from field: int32 attributeId = 1;
   */
  attributeId: number;
};

/**
 * Describes the message CommandMessage.GetAttributeValue.
 * Use `create(CommandMessage_GetAttributeValueSchema)` to create a new message.
 */
export const CommandMessage_GetAttributeValueSchema: GenMessage<CommandMessage_GetAttributeValue> = /*@__PURE__*/
  messageDesc(file_fixture, 0, 2);

/**
 * @generated from message CommandMessage.GetAttributeValues
 */
export type CommandMessage_GetAttributeValues = Message<"CommandMessage.GetAttributeValues"> & {
  /**
   * @generated from field: repeated int32 attributeIds = 1;
   */
  attributeIds: number[];
};

/**
 * Describes the message CommandMessage.GetAttributeValues.
 * Use `create(CommandMessage_GetAttributeValuesSchema)` to create a new message.
 */
export const CommandMessage_GetAttributeValuesSchema: GenMessage<CommandMessage_GetAttributeValues> = /*@__PURE__*/
  messageDesc(file_fixture, 0, 3);

/**
 * @generated from message CommandMessage.SetAttributeValue
 */
export type CommandMessage_SetAttributeValue = Message<"CommandMessage.SetAttributeValue"> & {
  /**
   * @generated from field: AttributeValue data = 1;
   */
  data?: AttributeValue;
};

/**
 * Describes the message CommandMessage.SetAttributeValue.
 * Use `create(CommandMessage_SetAttributeValueSchema)` to create a new message.
 */
export const CommandMessage_SetAttributeValueSchema: GenMessage<CommandMessage_SetAttributeValue> = /*@__PURE__*/
  messageDesc(file_fixture, 0, 4);

/**
 * @generated from message CommandMessage.SetAttributeValues
 */
export type CommandMessage_SetAttributeValues = Message<"CommandMessage.SetAttributeValues"> & {
  /**
   * @generated from field: repeated AttributeValue data = 1;
   */
  data: AttributeValue[];
};

/**
 * Describes the message CommandMessage.SetAttributeValues.
 * Use `create(CommandMessage_SetAttributeValuesSchema)` to create a new message.
 */
export const CommandMessage_SetAttributeValuesSchema: GenMessage<CommandMessage_SetAttributeValues> = /*@__PURE__*/
  messageDesc(file_fixture, 0, 5);

/**
 * @generated from message ResponseMessage
 */
export type ResponseMessage = Message<"ResponseMessage"> & {
  /**
   * @generated from oneof ResponseMessage.response
   */
  response: {
    /**
     * @generated from field: ResponseMessage.SetConfigResponse setConfigResponse = 1;
     */
    value: ResponseMessage_SetConfigResponse;
    case: "setConfigResponse";
  } | {
    /**
     * @generated from field: ResponseMessage.InfoResponse info = 2;
     */
    value: ResponseMessage_InfoResponse;
    case: "info";
  } | {
    /**
     * @generated from field: ResponseMessage.StatusResponse status = 3;
     */
    value: ResponseMessage_StatusResponse;
    case: "status";
  } | {
    /**
     * @generated from field: ResponseMessage.HandshakeResponse handshake = 4;
     */
    value: ResponseMessage_HandshakeResponse;
    case: "handshake";
  } | {
    /**
     * @generated from field: ResponseMessage.FixtureDefinitionResponse fixtureDefinition = 5;
     */
    value: ResponseMessage_FixtureDefinitionResponse;
    case: "fixtureDefinition";
  } | {
    /**
     * @generated from field: AttributeValue attributeValue = 6;
     */
    value: AttributeValue;
    case: "attributeValue";
  } | {
    /**
     * @generated from field: ResponseMessage.AttributeValues attributeValues = 7;
     */
    value: ResponseMessage_AttributeValues;
    case: "attributeValues";
  } | { case: undefined; value?: undefined };
};

/**
 * Describes the message ResponseMessage.
 * Use `create(ResponseMessageSchema)` to create a new message.
 */
export const ResponseMessageSchema: GenMessage<ResponseMessage> = /*@__PURE__*/
  messageDesc(file_fixture, 1);

/**
 * @generated from message ResponseMessage.SetConfigResponse
 */
export type ResponseMessage_SetConfigResponse = Message<"ResponseMessage.SetConfigResponse"> & {
  /**
   * @generated from field: bool success = 1;
   */
  success: boolean;
};

/**
 * Describes the message ResponseMessage.SetConfigResponse.
 * Use `create(ResponseMessage_SetConfigResponseSchema)` to create a new message.
 */
export const ResponseMessage_SetConfigResponseSchema: GenMessage<ResponseMessage_SetConfigResponse> = /*@__PURE__*/
  messageDesc(file_fixture, 1, 0);

/**
 * @generated from message ResponseMessage.InfoResponse
 */
export type ResponseMessage_InfoResponse = Message<"ResponseMessage.InfoResponse"> & {
  /**
   * @generated from field: string manufacturer = 1;
   */
  manufacturer: string;

  /**
   * @generated from field: string model = 2;
   */
  model: string;

  /**
   * @generated from field: string serialNumber = 3;
   */
  serialNumber: string;

  /**
   * @generated from field: SemVer firmwareVersion = 4;
   */
  firmwareVersion?: SemVer;

  /**
   * @generated from field: SemVer hardwareVersion = 5;
   */
  hardwareVersion?: SemVer;
};

/**
 * Describes the message ResponseMessage.InfoResponse.
 * Use `create(ResponseMessage_InfoResponseSchema)` to create a new message.
 */
export const ResponseMessage_InfoResponseSchema: GenMessage<ResponseMessage_InfoResponse> = /*@__PURE__*/
  messageDesc(file_fixture, 1, 1);

/**
 * @generated from message ResponseMessage.StatusResponse
 */
export type ResponseMessage_StatusResponse = Message<"ResponseMessage.StatusResponse"> & {
  /**
   * enum: OK, WARNING, ERROR
   *
   * @generated from field: ResponseMessage.StatusResponse.StatusCode status = 1;
   */
  status: ResponseMessage_StatusResponse_StatusCode;
};

/**
 * Describes the message ResponseMessage.StatusResponse.
 * Use `create(ResponseMessage_StatusResponseSchema)` to create a new message.
 */
export const ResponseMessage_StatusResponseSchema: GenMessage<ResponseMessage_StatusResponse> = /*@__PURE__*/
  messageDesc(file_fixture, 1, 2);

/**
 * @generated from enum ResponseMessage.StatusResponse.StatusCode
 */
export enum ResponseMessage_StatusResponse_StatusCode {
  /**
   * @generated from enum value: OK = 0;
   */
  OK = 0,

  /**
   * @generated from enum value: WARNING = 1;
   */
  WARNING = 1,

  /**
   * @generated from enum value: ERROR = 2;
   */
  ERROR = 2,
}

/**
 * Describes the enum ResponseMessage.StatusResponse.StatusCode.
 */
export const ResponseMessage_StatusResponse_StatusCodeSchema: GenEnum<ResponseMessage_StatusResponse_StatusCode> = /*@__PURE__*/
  enumDesc(file_fixture, 1, 2, 0);

/**
 * @generated from message ResponseMessage.HandshakeResponse
 */
export type ResponseMessage_HandshakeResponse = Message<"ResponseMessage.HandshakeResponse"> & {
  /**
   * @generated from field: bool success = 1;
   */
  success: boolean;
};

/**
 * Describes the message ResponseMessage.HandshakeResponse.
 * Use `create(ResponseMessage_HandshakeResponseSchema)` to create a new message.
 */
export const ResponseMessage_HandshakeResponseSchema: GenMessage<ResponseMessage_HandshakeResponse> = /*@__PURE__*/
  messageDesc(file_fixture, 1, 3);

/**
 * @generated from message ResponseMessage.FixtureDefinitionResponse
 */
export type ResponseMessage_FixtureDefinitionResponse = Message<"ResponseMessage.FixtureDefinitionResponse"> & {
  /**
   * @generated from field: string json = 1;
   */
  json: string;
};

/**
 * Describes the message ResponseMessage.FixtureDefinitionResponse.
 * Use `create(ResponseMessage_FixtureDefinitionResponseSchema)` to create a new message.
 */
export const ResponseMessage_FixtureDefinitionResponseSchema: GenMessage<ResponseMessage_FixtureDefinitionResponse> = /*@__PURE__*/
  messageDesc(file_fixture, 1, 4);

/**
 * @generated from message ResponseMessage.AttributeValues
 */
export type ResponseMessage_AttributeValues = Message<"ResponseMessage.AttributeValues"> & {
  /**
   * @generated from field: repeated AttributeValue data = 1;
   */
  data: AttributeValue[];
};

/**
 * Describes the message ResponseMessage.AttributeValues.
 * Use `create(ResponseMessage_AttributeValuesSchema)` to create a new message.
 */
export const ResponseMessage_AttributeValuesSchema: GenMessage<ResponseMessage_AttributeValues> = /*@__PURE__*/
  messageDesc(file_fixture, 1, 5);

/**
 * @generated from message AttributeValue
 */
export type AttributeValue = Message<"AttributeValue"> & {
  /**
   * @generated from field: int32 attributeId = 1;
   */
  attributeId: number;

  /**
   * @generated from oneof AttributeValue.value
   */
  value: {
    /**
     * @generated from field: float floatValue = 2;
     */
    value: number;
    case: "floatValue";
  } | {
    /**
     * @generated from field: string stringValue = 3;
     */
    value: string;
    case: "stringValue";
  } | { case: undefined; value?: undefined };
};

/**
 * Describes the message AttributeValue.
 * Use `create(AttributeValueSchema)` to create a new message.
 */
export const AttributeValueSchema: GenMessage<AttributeValue> = /*@__PURE__*/
  messageDesc(file_fixture, 2);

/**
 * @generated from message SemVer
 */
export type SemVer = Message<"SemVer"> & {
  /**
   * @generated from field: int32 major = 1;
   */
  major: number;

  /**
   * @generated from field: int32 minor = 2;
   */
  minor: number;

  /**
   * @generated from field: int32 patch = 3;
   */
  patch: number;
};

/**
 * Describes the message SemVer.
 * Use `create(SemVerSchema)` to create a new message.
 */
export const SemVerSchema: GenMessage<SemVer> = /*@__PURE__*/
  messageDesc(file_fixture, 3);

