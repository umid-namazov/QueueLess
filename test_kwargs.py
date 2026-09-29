def f(**kwargs):
    print(kwargs)

d = {"a": 1, "b": 2}

try:
    f(**d, a=3)
except Exception as e:
    print(f"Error: {e}")
