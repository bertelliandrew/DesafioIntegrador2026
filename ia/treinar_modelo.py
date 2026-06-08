import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import accuracy_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "dados_treinamento.csv")
MODEL_PATH = os.path.join(BASE_DIR, "modelo_random_forest.pkl")
FEATURES = [
    "total_assinaturas",
    "assinaturas_ativas",
    "assinaturas_canceladas",
    "valor_mensal_total",
    "quantidade_firewalls_total",
    "usa_ciclo_anual",
    "maior_preco_plano",
    "dias_cliente",
]


def tratar_dados(df):
    df = df.drop_duplicates()
    df = df.fillna(0)

    for coluna in FEATURES:
        q1 = df[coluna].quantile(0.25)
        q3 = df[coluna].quantile(0.75)
        iqr = q3 - q1
        limite_baixo = q1 - 1.5 * iqr
        limite_alto = q3 + 1.5 * iqr
        df[coluna] = df[coluna].clip(limite_baixo, limite_alto)

    return df


def treinar():
    df = pd.read_csv(CSV_PATH)
    df = tratar_dados(df)

    x = df[FEATURES]
    y_churn = df["churn"]
    y_compra = df["compra"]

    scaler = MinMaxScaler()
    x_normalizado = scaler.fit_transform(x)

    modelo_churn = RandomForestClassifier(n_estimators=80, max_depth=5, random_state=42)
    modelo_compra = RandomForestClassifier(n_estimators=80, max_depth=5, random_state=42)

    x_train, x_test, y_train, y_test = train_test_split(
        x_normalizado, y_churn, test_size=0.25, random_state=42
    )
    modelo_churn.fit(x_train, y_train)
    acc_churn = accuracy_score(y_test, modelo_churn.predict(x_test))

    x_train, x_test, y_train, y_test = train_test_split(
        x_normalizado, y_compra, test_size=0.25, random_state=42
    )
    modelo_compra.fit(x_train, y_train)
    acc_compra = accuracy_score(y_test, modelo_compra.predict(x_test))

    joblib.dump(
        {
            "features": FEATURES,
            "scaler": scaler,
            "modelo_churn": modelo_churn,
            "modelo_compra": modelo_compra,
            "acuracia_churn": round(float(acc_churn), 2),
            "acuracia_compra": round(float(acc_compra), 2),
        },
        MODEL_PATH,
    )

    print("Modelo Random Forest treinado com sucesso.")
    print(f"Acuracia churn: {round(float(acc_churn), 2)}")
    print(f"Acuracia compra: {round(float(acc_compra), 2)}")


if __name__ == "__main__":
    treinar()
