/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/rotor.json`.
 */
export type Rotor = {
  "address": "GHLyEoD7GMM14KQj1ydEGExkvaNH3Y2P2X19NVN4DyPX",
  "metadata": {
    "name": "rotor",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "cancelTimeCapsule",
      "discriminator": [
        106,
        175,
        188,
        138,
        106,
        242,
        6,
        97
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true,
          "relations": [
            "timeCapsule"
          ]
        },
        {
          "name": "timeCapsule",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  109,
                  101,
                  45,
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "account",
                "path": "time_capsule.capsule_id",
                "account": "timeCapsule"
              }
            ]
          }
        },
        {
          "name": "capsuleVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "timeCapsule"
              }
            ]
          }
        },
        {
          "name": "recipientProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  45,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "time_capsule.recipient",
                "account": "timeCapsule"
              }
            ]
          }
        },
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createTimeCapsule",
      "discriminator": [
        119,
        131,
        35,
        39,
        37,
        157,
        71,
        37
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "creatorProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  45,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "recipient"
        },
        {
          "name": "recipientProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  45,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "recipient"
              }
            ]
          }
        },
        {
          "name": "timeCapsule",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  109,
                  101,
                  45,
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "arg",
                "path": "capsuleId"
              }
            ]
          }
        },
        {
          "name": "capsuleVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "timeCapsule"
              }
            ]
          }
        },
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "capsuleId",
          "type": "u64"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "message",
          "type": "string"
        },
        {
          "name": "unlockAt",
          "type": "i64"
        },
        {
          "name": "lockedSol",
          "type": "u64"
        },
        {
          "name": "isPublic",
          "type": "bool"
        },
        {
          "name": "capsuleType",
          "type": {
            "defined": {
              "name": "capsuleType"
            }
          }
        }
      ]
    },
    {
      "name": "initializeGlobalState",
      "discriminator": [
        232,
        254,
        209,
        244,
        123,
        89,
        154,
        207
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "feeWallet"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "platformFeeBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "initializeUserProfile",
      "discriminator": [
        192,
        144,
        204,
        140,
        113,
        25,
        59,
        102
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  45,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteTimeCapsule",
      "discriminator": [
        142,
        252,
        118,
        13,
        250,
        188,
        11,
        141
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true,
          "relations": [
            "timeCapsule"
          ]
        },
        {
          "name": "timeCapsule",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  109,
                  101,
                  45,
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "account",
                "path": "time_capsule.capsule_id",
                "account": "timeCapsule"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "transferCapsuleRecipient",
      "discriminator": [
        6,
        114,
        170,
        102,
        136,
        174,
        25,
        66
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true,
          "relations": [
            "timeCapsule"
          ]
        },
        {
          "name": "timeCapsule",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  109,
                  101,
                  45,
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "account",
                "path": "time_capsule.capsule_id",
                "account": "timeCapsule"
              }
            ]
          }
        },
        {
          "name": "oldRecipientProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  45,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "time_capsule.recipient",
                "account": "timeCapsule"
              }
            ]
          }
        },
        {
          "name": "newRecipientProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  45,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "newRecipient"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newRecipient",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "unlockTimeCapsule",
      "discriminator": [
        6,
        69,
        220,
        173,
        163,
        118,
        231,
        71
      ],
      "accounts": [
        {
          "name": "recipient",
          "writable": true,
          "signer": true,
          "relations": [
            "timeCapsule"
          ]
        },
        {
          "name": "timeCapsule",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  109,
                  101,
                  45,
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "time_capsule.creator",
                "account": "timeCapsule"
              },
              {
                "kind": "account",
                "path": "time_capsule.capsule_id",
                "account": "timeCapsule"
              }
            ]
          }
        },
        {
          "name": "capsuleVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  112,
                  115,
                  117,
                  108,
                  101,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "timeCapsule"
              }
            ]
          }
        },
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "feeWallet",
          "writable": true,
          "relations": [
            "globalState"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "capsuleVault",
      "discriminator": [
        225,
        9,
        59,
        4,
        93,
        88,
        13,
        247
      ]
    },
    {
      "name": "globalState",
      "discriminator": [
        163,
        46,
        74,
        168,
        216,
        123,
        133,
        98
      ]
    },
    {
      "name": "timeCapsule",
      "discriminator": [
        38,
        234,
        70,
        41,
        29,
        26,
        27,
        7
      ]
    },
    {
      "name": "userProfile",
      "discriminator": [
        32,
        37,
        119,
        205,
        179,
        180,
        13,
        194
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "usernameTooLong",
      "msg": "Username too long (max 32 chars)"
    },
    {
      "code": 6001,
      "name": "titleTooLong",
      "msg": "Title too long (max 64 chars)"
    },
    {
      "code": 6002,
      "name": "messageTooLong",
      "msg": "Message too long (max 280 chars)"
    },
    {
      "code": 6003,
      "name": "invalidUnlockDate",
      "msg": "Unlock time must be in the future"
    },
    {
      "code": 6004,
      "name": "capsuleStillLocked",
      "msg": "Capsule is still locked"
    },
    {
      "code": 6005,
      "name": "alreadyUnlocked",
      "msg": "Capsule is already unlocked"
    },
    {
      "code": 6006,
      "name": "capsuleCancelled",
      "msg": "Capsule is cancelled"
    },
    {
      "code": 6007,
      "name": "unauthorized",
      "msg": "Unauthorized access"
    },
    {
      "code": 6008,
      "name": "insufficientFunds",
      "msg": "Insufficient funds to lock"
    }
  ],
  "types": [
    {
      "name": "capsuleType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "personal"
          },
          {
            "name": "gift"
          },
          {
            "name": "collective"
          },
          {
            "name": "legacy"
          }
        ]
      }
    },
    {
      "name": "capsuleVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "capsule",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "globalState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "totalCapsules",
            "type": "u64"
          },
          {
            "name": "totalUnlocked",
            "type": "u64"
          },
          {
            "name": "totalSolLocked",
            "type": "u64"
          },
          {
            "name": "feeWallet",
            "type": "pubkey"
          },
          {
            "name": "platformFeeBps",
            "type": "u16"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "timeCapsule",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "recipient",
            "type": "pubkey"
          },
          {
            "name": "capsuleId",
            "type": "u64"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "message",
            "type": "string"
          },
          {
            "name": "lockedSol",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "unlockAt",
            "type": "i64"
          },
          {
            "name": "unlockedAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "isCancelled",
            "type": "bool"
          },
          {
            "name": "isPublic",
            "type": "bool"
          },
          {
            "name": "capsuleType",
            "type": {
              "defined": {
                "name": "capsuleType"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "username",
            "type": "string"
          },
          {
            "name": "totalCapsulesCreated",
            "type": "u32"
          },
          {
            "name": "totalCapsulesReceived",
            "type": "u32"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
