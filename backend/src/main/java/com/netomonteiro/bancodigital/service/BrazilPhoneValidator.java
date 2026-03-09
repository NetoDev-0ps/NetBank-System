package com.netomonteiro.bancodigital.service;

import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class BrazilPhoneValidator {

    private static final Set<String> VALID_DDDS = Set.of(
        "11", "12", "13", "14", "15", "16", "17", "18", "19",
        "21", "22", "24", "27", "28",
        "31", "32", "33", "34", "35", "37", "38",
        "41", "42", "43", "44", "45", "46",
        "47", "48", "49",
        "51", "53", "54", "55",
        "61", "62", "64", "63",
        "65", "66", "67", "68", "69",
        "71", "73", "74", "75", "77",
        "79",
        "81", "82", "83", "84", "85", "86", "87", "88", "89",
        "91", "92", "93", "94", "95", "96", "97", "98", "99"
    );

    public boolean hasValidDdd(String telefoneNumerico) {
        if (telefoneNumerico == null || !telefoneNumerico.matches("^\\d{10,11}$")) {
            return false;
        }

        return VALID_DDDS.contains(telefoneNumerico.substring(0, 2));
    }
}
