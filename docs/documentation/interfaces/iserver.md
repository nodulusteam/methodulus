[@methodus/server](../README.md) > [IServer](../interfaces/iserver.md)

# Interface: IServer

## Hierarchy

**IServer**

## Index

### Properties

* [classRouters](iserver.md#classrouters)
* [config](iserver.md#config)
* [sockets](iserver.md#sockets)

### Methods

* [_send](iserver.md#_send)
* [useClass](iserver.md#useclass)

---

## Properties

<a id="classrouters"></a>

###  classRouters

**● classRouters**: *`any`[]*

*Defined in [interfaces/methodus.ts:19](https://github.com/nodulusteam/methodus.dev/blob/907fca8/src/interfaces/methodus.ts#L19)*

___
<a id="config"></a>

###  config

**● config**: *[IMethodusConfig](imethodusconfig.md)*

*Defined in [interfaces/methodus.ts:20](https://github.com/nodulusteam/methodus.dev/blob/907fca8/src/interfaces/methodus.ts#L20)*

___
<a id="sockets"></a>

### `<Optional>` sockets

**● sockets**: *`any`*

*Defined in [interfaces/methodus.ts:21](https://github.com/nodulusteam/methodus.dev/blob/907fca8/src/interfaces/methodus.ts#L21)*

___

## Methods

<a id="_send"></a>

###  _send

▸ **_send**(channel: *`any`*, functionArgs: *`any`*, message: *`any`*, paramsMap?: *`any`*): `any`

*Defined in [interfaces/methodus.ts:23](https://github.com/nodulusteam/methodus.dev/blob/907fca8/src/interfaces/methodus.ts#L23)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| channel | `any` |
| functionArgs | `any` |
| message | `any` |
| `Optional` paramsMap | `any` |

**Returns:** `any`

___
<a id="useclass"></a>

###  useClass

▸ **useClass**(classType: *`any`*, methodType: *[MethodType](../enums/methodtype.md)*): `void`

*Defined in [interfaces/methodus.ts:22](https://github.com/nodulusteam/methodus.dev/blob/907fca8/src/interfaces/methodus.ts#L22)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| classType | `any` |
| methodType | [MethodType](../enums/methodtype.md) |

**Returns:** `void`

___
