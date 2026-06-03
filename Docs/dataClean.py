import pandas as pd

df = pd.read_csv("Docs/ntfs_permissions_audit.csv", dtype=str)

df = df.apply(lambda x: x.str.strip().fillna("NULL").replace("", "NULL"))

df.to_csv("Docs/cleaned_data.csv", index=False)