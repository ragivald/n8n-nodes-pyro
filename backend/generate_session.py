from pyrogram import Client
import getpass

def main():
    print("=== Pyrogram Session String Generator ===")
    api_id = int(input("Enter your api_id: ").strip())
    api_hash = input("Enter your api_hash: ").strip()
    print("Choose login method:")
    print("1. User (phone number)")
    print("2. Bot (bot token)")
    method = input("Enter 1 or 2: ").strip()

    if method == "1":
        phone_number = input("Enter your phone number (with country code): ").strip()
        client = Client("gen_session", api_id=api_id, api_hash=api_hash)
        with client:
            print("You may be asked for a code in the next step.")
            session_string = client.export_session_string()
            print("\nYour session string:\n")
            print(session_string)
    elif method == "2":
        bot_token = getpass.getpass("Enter your bot token: ").strip()
        client = Client("gen_session", api_id=api_id, api_hash=api_hash, bot_token=bot_token)
        with client:
            session_string = client.export_session_string()
            print("\nYour session string:\n")
            print(session_string)
    else:
        print("Invalid method selected.")

if __name__ == "__main__":
    main()