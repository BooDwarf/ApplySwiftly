export function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const FIELD_ALIASES = {
  firstName: ["firstname", "givenname", "fname"],
  lastName: ["lastname", "surname", "lname"],
  email: ["email", "emailaddress"],
  phone: ["phone", "phonenumber", "mobile"],
  coverLetter: ["coverletter", "motivationletter"]
};

export function matchField(text) {
  const normalized = normalize(text);

  let bestMatch = null;
  let highestScore = 0;

  for (const field in FIELD_ALIASES) {
    for (const alias of FIELD_ALIASES[field]) {
      if (normalized.includes(alias)) {
        const score = alias.length / normalized.length;
        if (score > highestScore) {
          highestScore = score;
          bestMatch = field;
        }
      }
    }
  }

  return {
    field: bestMatch,
    confidence: highestScore
  };
}
