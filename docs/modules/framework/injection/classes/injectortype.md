[Methodus - framework injection](../README.md) › [Globals](../globals.md) › [InjectorType](modules/framework/injection/injectortype.md)

# Class: InjectorType

## Hierarchy

* **InjectorType**

## Index

### Properties

* [records](#private-records)
* [singletons](#private-singletons)

### Methods

* [get](#get)
* [inject](#inject)
* [register](#register)
* [resolveAndCreate](#resolveandcreate)

## Properties

### `Private` records

• **records**: *any*

Defined in dist/injector/index.d.ts:10

___

### `Private` singletons

• **singletons**: *any*

Defined in dist/injector/index.d.ts:11

## Methods

###  get

▸ **get**‹**T**›(`_token`: any): *T*

Defined in dist/injector/index.d.ts:15

**Type parameters:**

▪ **T**

**Parameters:**

Name | Type |
------ | ------ |
`_token` | any |

**Returns:** *T*

___

###  inject

▸ **inject**(`registrationType`: [RegistrationTypes](../enums/registrationtypes.md), `target`: any, `name?`: undefined | string): *void*

Defined in dist/injector/index.d.ts:12

**Parameters:**

Name | Type |
------ | ------ |
`registrationType` | [RegistrationTypes](../enums/registrationtypes.md) |
`target` | any |
`name?` | undefined &#124; string |

**Returns:** *void*

___

###  register

▸ **register**(`token`: any, `deps`: any, `registrationType`: [RegistrationTypes](../enums/registrationtypes.md), `alias?`: undefined | string): *void*

Defined in dist/injector/index.d.ts:14

**Parameters:**

Name | Type |
------ | ------ |
`token` | any |
`deps` | any |
`registrationType` | [RegistrationTypes](../enums/registrationtypes.md) |
`alias?` | undefined &#124; string |

**Returns:** *void*

___

###  resolveAndCreate

▸ **resolveAndCreate**(`tokens`: Array‹any›): *this*

Defined in dist/injector/index.d.ts:13

**Parameters:**

Name | Type |
------ | ------ |
`tokens` | Array‹any› |

**Returns:** *this*
