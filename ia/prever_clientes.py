import json
import os
import sys
import subprocess
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "modelo_random_forest.pkl")
TRAIN_PATH = os.path.join(BASE_DIR, "treinar_modelo.py")


def garantir_modelo():
    if not os.path.exists(MODEL_PATH):
        subprocess.run([sys.executable, TRAIN_PATH], check=True, capture_output=True, text=True)


def classificar(risco):
    if risco >= 70:
        return "Alto risco"
    if risco >= 40:
        return "Risco médio"
    return "Baixo risco"


def recomendar(risco, compra):
    if risco >= 70:
        return "Entrar em contato e oferecer benefício para evitar cancelamento."
    if compra >= 70:
        return "Cliente com boa chance de upgrade. Oferecer plano superior."
    if risco >= 40:
        return "Acompanhar o cliente e verificar satisfação."
    return "Manter relacionamento normal com o cliente."


def main():
    garantir_modelo()
    pacote = joblib.load(MODEL_PATH)
    entrada = json.loads(sys.stdin.read() or "[]")

    if len(entrada) == 0:
        print(json.dumps({"modelo": "Random Forest", "clientes": []}, ensure_ascii=False))
        return

    features = pacote["features"]
    df = pd.DataFrame(entrada)

    for coluna in features:
        if coluna not in df.columns:
            df[coluna] = 0

    x = pacote["scaler"].transform(df[features].fillna(0))
    prob_churn = pacote["modelo_churn"].predict_proba(x)[:, 1]
    prob_compra = pacote["modelo_compra"].predict_proba(x)[:, 1]

    clientes = []
    for i, item in enumerate(entrada):
        risco = round(float(prob_churn[i]) * 100, 2)
        compra = round(float(prob_compra[i]) * 100, 2)
        clientes.append({
            "clienteId": item.get("clienteId"),
            "nome": item.get("nome"),
            "email": item.get("email"),
            "estado": item.get("estado"),
            "riscoChurn": risco,
            "propensaoCompra": compra,
            "classificacao": classificar(risco),
            "recomendacao": recomendar(risco, compra),
        })

    clientes = sorted(clientes, key=lambda c: c["riscoChurn"], reverse=True)

    print(json.dumps({
        "modelo": "Random Forest",
        "tratamentoDados": "Remoção de duplicados, preenchimento de nulos, tratamento simples de outliers e normalização Min-Max.",
        "acuraciaChurn": pacote.get("acuracia_churn"),
        "acuraciaCompra": pacote.get("acuracia_compra"),
        "clientes": clientes,
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
