import pageindex
try:
    client = pageindex.PageIndexClient()
    print("Client init success")
except Exception as e:
    print("Client init error:", e)
