const express = require("express");

const app = express();

const API =
"https://bcf-ayt4.onrender.com/sexy/all";

function convert(v) {
    return v === "B"
        ? "Banker"
        : "Player";
}

function predict(ketQua) {

    if (!ketQua)
        return "Banker";

    // T không tính cầu
    const s =
        ketQua
        .toUpperCase()
        .replace(/T/g, "");

    const n =
        s.length;

    if (!n)
        return "Banker";

    const last =
        s[n - 1];

    //--------------------------------
    // BỆT >= 4
    //--------------------------------

    let streak = 1;

    for (
        let i = n - 2;
        i >= 0;
        i--
    ) {

        if (
            s[i] === last
        ) {
            streak++;
        } else {
            break;
        }

    }

    if (
        streak >= 4
    ) {

        return convert(
            last
        );

    }

    //--------------------------------
    // CẦU 1-1
    // BPBPB -> P
    // PBPBP -> B
    //--------------------------------

    if (
        n >= 5
    ) {

        const c =
            s.slice(
                -5
            );

        if (
            c === "BPBPB"
        ) {

            return "Player";

        }

        if (
            c === "PBPBP"
        ) {

            return "Banker";

        }

    }

    //--------------------------------
    // CẦU 2-2
    //--------------------------------

    if (
        n >= 8
    ) {

        const a =
            s.slice(
                -8,
                -4
            );

        const b =
            s.slice(
                -4
            );

        if (
            a === b
        ) {

            return convert(
                b[0]
            );

        }

    }

    //--------------------------------
    // CẦU 3-3
    //--------------------------------

    if (
        n >= 9
    ) {

        const a =
            s.slice(
                -9,
                -6
            );

        const b =
            s.slice(
                -6,
                -3
            );

        const c =
            s.slice(
                -3
            );

        if (
            a === b &&
            b === c
        ) {

            return convert(
                c[0]
            );

        }

    }

    //--------------------------------
    // CẦU 4-2
    //--------------------------------

    if (
        n >= 6
    ) {

        const x =
            s.slice(
                -6,
                -2
            );

        const same =
            x
            .split("")
            .every(
                v =>
                v ===
                x[0]
            );

        if (
            same
        ) {

            return convert(
                s[
                    n - 2
                ]
            );

        }

    }

    //--------------------------------
    // KHÔNG CÓ CẦU
    //--------------------------------

    return convert(
        last
    );

}

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

du_doan:
predict(
raw
)

};

}
);

res.json(
result
);

}
catch (
e
) {

res
.status(
500
)
.json({
error:
e.message
});

}

}
);

const PORT = process.env.PORT || 5000;

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