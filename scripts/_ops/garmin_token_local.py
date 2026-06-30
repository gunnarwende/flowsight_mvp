#!/usr/bin/env python3
"""
garmin_token_local.py — LOKAL ausführen (eigene Internet-Verbindung).

Erzeugt ein Garmin-Token (garth), das du in der App unter
  /ceo/leben → Running → „Token einfügen"
einsetzt. Umgeht die 429-Drossel, die Garmin auf Server-/Rechenzentrums-IPs legt.

Nichts wird gespeichert oder irgendwohin gesendet — das Token wird nur ausgegeben.

  pip3 install garth
  python3 scripts/_ops/garmin_token_local.py
"""
import getpass
import garth

email = input("Garmin E-Mail: ").strip()
password = getpass.getpass("Garmin Passwort: ")
mfa = input("2-Faktor-Code (Enter, wenn keiner aktiv): ").strip()

if mfa:
    garth.login(email, password, prompt_mfa=lambda: mfa)
else:
    garth.login(email, password)

print("\n=== TOKEN (alles unten kopieren und in der App einfügen) ===\n")
print(garth.client.dumps())
