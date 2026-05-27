const express = require("express");

const app = express();

const API =
"https://bcf-ayt4.onrender.com/sexy/all";

//================================
// AI MEMORY
//================================

const AI_MEMORY = {

    patterns: {},

    stats: {

        total: 0,
        win: 0,
        lose: 0

    }

};

//================================
// UTILS
//================================

function convert(v) {

    return v === "B"
        ? "Banker"
        : "Player";

}

function opposite(v) {

    return v === "B"
        ? "P"
        : "B";

}

//================================
// BUILD GROUPS
//================================

function buildGroups(s) {

    if (!s.length)
        return [];

    const groups = [];

    let current =
        s[0];

    let count = 1;

    for (
        let i = 1;
        i < s.length;
        i++
    ) {

        if (
            s[i] === current
        ) {

            count++;

        } else {

            groups.push({

                side:
                current,

                len:
                count

            });

            current =
                s[i];

            count = 1;

        }

    }

    groups.push({

        side:
        current,

        len:
        count

    });

    return groups;

}

//================================
// PATTERN KEY
//================================

function getPatternKey(groups) {

    return groups
        .map(
            v => v.len
        )
        .join("-");

}

//================================
// AI SCORE
//================================

function scorePattern(recent) {

    const last =
        recent[
            recent.length - 1
        ];

    const prev =
        recent[
            recent.length - 2
        ];

    let follow = 0;
    let reverse = 0;

    //--------------------------------
    // BỆT
    //--------------------------------

    if (
        last.len >= 5
    ) {

        follow += 7;

    }
    else if (
        last.len >= 4
    ) {

        follow += 5;

    }
    else if (
        last.len >= 3
    ) {

        follow += 3;

    }

    //--------------------------------
    // ĐẢO 1-1
    //--------------------------------

    const allOne =
        recent.every(
            v => v.len === 1
        );

    if (
        allOne
    ) {

        reverse += 7;

    }

    //--------------------------------
    // NHỊP ĐỀU
    //--------------------------------

    if (
        prev &&
        prev.len === last.len
    ) {

        follow += 5;

    }

    //--------------------------------
    // 4-2
    //--------------------------------

    if (
        prev &&
        prev.len === 4 &&
        last.len === 2
    ) {

        reverse += 4;

    }

    //--------------------------------
    // 3-2
    //--------------------------------

    if (
        prev &&
        prev.len === 3 &&
        last.len === 2
    ) {

        reverse += 3;

    }

    //--------------------------------
    // 2-1
    //--------------------------------

    if (
        prev &&
        prev.len === 2 &&
        last.len === 1
    ) {

        reverse += 2;

    }

    //--------------------------------
    // 4-4
    //--------------------------------

    if (
        prev &&
        prev.len === 4 &&
        last.len === 4
    ) {

        follow += 4;

    }

    //--------------------------------
    // 3-3
    //--------------------------------

    if (
        prev &&
        prev.len === 3 &&
        last.len === 3
    ) {

        follow += 3;

    }

    //--------------------------------
    // 2-2
    //--------------------------------

    if (
        prev &&
        prev.len === 2 &&
        last.len === 2
    ) {

        follow += 2;

    }

    return {

        follow,
        reverse

    };

}

//================================
// AI PREDICT
//================================

function predict(raw) {

    if (!raw)
        return {

            result:
            "Banker",

            confidence:
            50,

            pattern:
            "NONE"

        };

    const s =
        raw
        .toUpperCase()
        .replace(/T/g, "");

    if (!s.length)
        return {

            result:
            "Banker",

            confidence:
            50,

            pattern:
            "NONE"

        };

    //--------------------------------
    // BUILD GROUPS
    //--------------------------------

    const groups =
        buildGroups(s);

    //--------------------------------
    // RECENT
    //--------------------------------

    const recent =
        groups.slice(-6);

    const last =
        recent[
            recent.length - 1
        ];

    //--------------------------------
    // PATTERN
    //--------------------------------

    const pattern =
        getPatternKey(
            recent
        );

    //--------------------------------
    // MEMORY
    //--------------------------------

    if (
        !AI_MEMORY.patterns[
            pattern
        ]
    ) {

        AI_MEMORY.patterns[
            pattern
        ] = {

            follow: 1,
            reverse: 1,
            total: 0,
            win: 0

        };

    }

    const memory =
        AI_MEMORY.patterns[
            pattern
        ];

    //--------------------------------
    // SCORE
    //--------------------------------

    const score =
        scorePattern(
            recent
        );

    let follow =
        score.follow;

    let reverse =
        score.reverse;

    //--------------------------------
    // AI LEARNING BOOST
    //--------------------------------

    follow +=
        memory.follow;

    reverse +=
        memory.reverse;

    //--------------------------------
    // TREND
    //--------------------------------

    const totalRecent =
        recent.reduce(
            (
                a,
                b
            ) =>
            a + b.len,
            0
        );

    if (
        totalRecent >= 15
    ) {

        follow += 2;

    }

    //--------------------------------
    // DECISION
    //--------------------------------

    let predictSide;

    if (
        reverse > follow
    ) {

        predictSide =
            opposite(
                last.side
            );

    } else {

        predictSide =
            last.side;

    }

    //--------------------------------
    // CONFIDENCE
    //--------------------------------

    const total =
        follow + reverse;

    const confidence =
        Math.min(
            99,
            Math.floor(
                (
                    Math.max(
                        follow,
                        reverse
                    ) / total
                ) * 100
            )
        );

    //--------------------------------
    // SAVE
    //--------------------------------

    memory.lastPredict =
        predictSide;

    return {

        result:
        convert(
            predictSide
        ),

        confidence,

        pattern

    };

}

//================================
// AI LEARN
//================================

function learn(raw) {

    const s =
        raw
        .toUpperCase()
        .replace(/T/g, "");

    if (
        s.length < 3
    ) return;

    //--------------------------------
    // BEFORE
    //--------------------------------

    const before =
        s.slice(
            0,
            -1
        );

    const real =
        s[
            s.length - 1
        ];

    //--------------------------------
    // BUILD
    //--------------------------------

    const groups =
        buildGroups(
            before
        );

    const recent =
        groups.slice(-6);

    //--------------------------------
    // PATTERN
    //--------------------------------

    const pattern =
        getPatternKey(
            recent
        );

    //--------------------------------
    // MEMORY
    //--------------------------------

    if (
        !AI_MEMORY.patterns[
            pattern
        ]
    ) {

        AI_MEMORY.patterns[
            pattern
        ] = {

            follow: 1,
            reverse: 1,
            total: 0,
            win: 0

        };

    }

    const memory =
        AI_MEMORY.patterns[
            pattern
        ];

    //--------------------------------
    // LAST
    //--------------------------------

    const last =
        recent[
            recent.length - 1
        ];

    //--------------------------------
    // LEARN
    //--------------------------------

    if (
        real === last.side
    ) {

        memory.follow++;

        AI_MEMORY.stats.win++;

    } else {

        memory.reverse++;

        AI_MEMORY.stats.lose++;

    }

    //--------------------------------
    // TOTAL
    //--------------------------------

    memory.total++;

    //--------------------------------
    // GLOBAL
    //--------------------------------

    AI_MEMORY.stats.total++;

}

//================================
// API
//================================

app.get(

"/dudoan/sexy/all",

async (
req,
res
) => {

try {

const r =
await fetch(
API
);

const data =
await r.json();

const result =
data.map(
item => {

const raw =
item.ket_qua ||
"";

learn(raw);

const ai =
predict(raw);

const lastRaw =
raw.length
? raw[
raw.length - 1
]
: "";

return {

ban:
item.ban,

phien:
Number(
item.phien
),

ket_qua_van_truoc:
lastRaw,

ket_qua:
raw,

phien_hien_tai:
Number(
item.phien
) + 1,

//================================
// GIỮ NGUYÊN PHẦN DỰ ĐOÁN
//================================

du_doan:
ai.result,

//================================
// VIP AI
//================================

do_tin_cay:
`${ai.confidence}%`,

pattern_hien_tai:
ai.pattern,

ai_follow:
AI_MEMORY.patterns[
    ai.pattern
]?.follow || 0,

ai_reverse:
AI_MEMORY.patterns[
    ai.pattern
]?.reverse || 0,

tong_hoc:
AI_MEMORY.patterns[
    ai.pattern
]?.total || 0

};

}
);

res.json({

success:
true,

ai_stats:
AI_MEMORY.stats,

total_room:
result.length,

data:
result

});

}
catch (e) {

res
.status(500)
.json({

error:
e.message

});

}

}

);

const PORT =
process.env.PORT || 5000;

app.listen(

PORT,

() => {

console.log(
`Server chạy cổng ${PORT}`
);

console.log(
"http://127.0.0.1:5000/dudoan/sexy/all"
);

}

);
