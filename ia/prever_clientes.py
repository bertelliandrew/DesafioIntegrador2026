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


def potencial(compra):
    if compra >= 70:
        return "Alto"
    if compra >= 40:
        return "Médio"
    return "Baixo"


def ajustar_situacao(item, risco, compra):
    cliente_cancelado = int(item.get("cliente_cancelado", 0)) == 1
    assinaturas_ativas = int(item.get("assinaturas_ativas", 0) or 0)
    assinaturas_canceladas = int(item.get("assinaturas_canceladas", 0) or 0)
    ativo_com_historico = assinaturas_ativas > 0 and assinaturas_canceladas > 0

    if cliente_cancelado:
        return {
            "riscoChurn": 100,
            "propensaoCompra": min(compra, 35),
            "classificacao": "Churn confirmado",
            "situacaoEstrategica": "Cliente cancelado",
            "statusAnalise": "Churn confirmado",
            "potencialCrescimento": "Reativação",
            "recomendacao": "Entrar em contato para tentar reativação com condição especial.",
        }

    if ativo_com_historico:
        return {
            "riscoChurn": risco,
            "propensaoCompra": compra,
            "classificacao": "Alto risco" if risco >= 70 else "Risco médio",
            "situacaoEstrategica": "Cliente ativo em atenção",
            "statusAnalise": "Alto risco de churn" if risco >= 70 else "Histórico de cancelamento",
            "potencialCrescimento": potencial(compra),
            "recomendacao": "Realizar contato preventivo e acompanhar satisfação do cliente.",
        }

    if compra >= 70 and risco < 60:
        return {
            "riscoChurn": risco,
            "propensaoCompra": compra,
            "classificacao": "Oportunidade de crescimento",
            "situacaoEstrategica": "Oportunidade de crescimento",
            "statusAnalise": "Baixo risco de churn",
            "potencialCrescimento": "Alto",
            "recomendacao": "Oferecer upgrade de plano ou pacote adicional de firewall.",
        }

    if risco >= 70:
        return {
            "riscoChurn": risco,
            "propensaoCompra": compra,
            "classificacao": "Alto risco",
            "situacaoEstrategica": "Cliente em risco",
            "statusAnalise": "Alto risco de churn",
            "potencialCrescimento": potencial(compra),
            "recomendacao": "Entrar em contato e oferecer benefício para evitar cancelamento.",
        }

    if risco >= 40:
        return {
            "riscoChurn": risco,
            "propensaoCompra": compra,
            "classificacao": "Risco médio",
            "situacaoEstrategica": "Cliente em acompanhamento",
            "statusAnalise": "Risco médio de churn",
            "potencialCrescimento": potencial(compra),
            "recomendacao": "Acompanhar o cliente e verificar satisfação.",
        }

    return {
        "riscoChurn": risco,
        "propensaoCompra": compra,
        "classificacao": "Cliente estável",
        "situacaoEstrategica": "Cliente estável",
        "statusAnalise": "Baixo risco de churn",
        "potencialCrescimento": potencial(compra),
        "recomendacao": "Manter relacionamento e avaliar oferta futura de upgrade." if compra >= 50 else "Manter relacionamento normal com o cliente.",
    }


def prioridade(cliente):
    if cliente["statusAnalise"] == "Churn confirmado":
        return 4
    if cliente["riscoChurn"] >= 70:
        return 3
    if cliente["propensaoCompra"] >= 70:
        return 2
    if cliente["riscoChurn"] >= 40:
        return 1
    return 0


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
        analise = ajustar_situacao(item, risco, compra)
        clientes.append({
            "clienteId": item.get("clienteId"),
            "nome": item.get("nome"),
            "email": item.get("email"),
            "estado": item.get("estado"),
            **analise,
        })

    clientes = sorted(clientes, key=lambda c: (prioridade(c), c["riscoChurn"], c["propensaoCompra"]), reverse=True)

    print(json.dumps({
        "modelo": "Random Forest",
        "tratamentoDados": "Remoção de duplicados, preenchimento de nulos, tratamento simples de outliers e normalização Min-Max.",
        "acuraciaChurn": pacote.get("acuracia_churn"),
        "acuraciaCompra": pacote.get("acuracia_compra"),
        "clientes": clientes,
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
