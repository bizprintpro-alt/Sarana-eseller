// ════════════════════════════════════════════════════════
// Mobile runtime config — served to eseller-mobile on boot.
//
// Public:
//   GET /config/mobile    no auth, no user scope
//
// Contract with eseller-mobile `src/config/remoteFlags.ts`:
//   {
//     malchnaas: {
//       enabled:        boolean,
//       pilotAimags:    string[],              // uppercase codes
//       aimagDelivery:  Record<code, string>   // e.g. "7-10" days
//     }
//   }
//
// Values live in code for v1 — the contract is stable enough to move
// to a Setting collection later without touching the mobile client.
// Mobile precedence: EXPO_PUBLIC_* default → AsyncStorage cache → this.
// ════════════════════════════════════════════════════════

const router = require('express').Router();

const PILOT_AIMAGS = ['AKH', 'TOV', 'SEL'];

// PRD §6.5 — must stay in sync with mobile `PROVINCES[].days` fallback.
const AIMAG_DELIVERY = {
  AKH: '7-10',
  BOL: '10-14',
  BKH: '7-10',
  BUL: '5-7',
  GOA: '10-14',
  GOS: '5-7',
  DAR: '3-5',
  DOR: '10-14',
  DOG: '5-7',
  DUN: '7-10',
  ZAV: '10-14',
  OVR: '7-10',
  OMN: '7-10',
  SUK: '7-10',
  SEL: '5-7',
  TOV: '3-5',
  UVS: '10-14',
  KHO: '10-14',
  KHV: '10-14',
  KHE: '7-10',
  ORK: '3-5',
};

router.get('/mobile', (req, res) => {
  res.json({
    malchnaas: {
      enabled:       true,
      pilotAimags:   PILOT_AIMAGS,
      aimagDelivery: AIMAG_DELIVERY,
    },
  });
});

module.exports = router;
