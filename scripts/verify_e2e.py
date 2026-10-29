import urllib.request
import json
import time

def main():
    print("Step 1: Testing /api/health...")
    res = urllib.request.urlopen("http://127.0.0.1:3000/api/health")
    health = json.loads(res.read())
    print("Health response:", health)
    assert health["status"] == "healthy"

    print("\nStep 2: Loading German Credit demo...")
    res_demo = urllib.request.urlopen("http://127.0.0.1:3000/api/demo/german_credit")
    d = json.loads(res_demo.read())
    print("Loaded demo:", d["dataset_id"], "Rows:", d["row_count"])

    print("\nStep 3: Dispatching audit...")
    payload = {
        "dataset_id": d["dataset_id"],
        "target": d["default_target"],
        "sensitive": d["default_sensitive"],
        "positive_label": d["default_positive"],
        "use_case": d["default_use_case"],
        "questionnaire": {}
    }
    req = urllib.request.Request(
        "http://127.0.0.1:3000/api/audit",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    res_audit = urllib.request.urlopen(req)
    job = json.loads(res_audit.read())
    print("Job response:", job)
    job_id = job["job_id"]

    print("\nStep 4: Polling job status...")
    for i in range(40):
        time.sleep(1)
        res_poll = urllib.request.urlopen(f"http://127.0.0.1:3000/api/audit/{job_id}")
        st = json.loads(res_poll.read())
        print(f"[{i+1}s] Stage: {st.get('stage')} | Progress: {st.get('progress')}% | Status: {st.get('status')}")
        if st.get("status") == "complete":
            res = st["result"]
            print("\n================ AUDIT COMPLETED SUCCESSFULLY ================")
            print(f"Overall Trust Score: {res['scores']['overall_trust_score']}")
            print(f"RAG Status: {res['scores']['rag_status']}")
            print(f"Readiness Verdict: {res['scores']['readiness_verdict']}")
            print(f"Weakest-Link Cap Reason: {res['scores']['cap_reason']}")
            print(f"Fairness Items: {len(res['fairness'])}")
            print(f"Top SHAP Feature: {res['explain']['top_features'][0]['feature']}")
            print(f"Robustness Score: {res['robustness']['robustness_score']}")
            print(f"EU AI Act Score: {res['compliance']['eu_ai_act']['score']}")
            print(f"India DPDP Score: {res['compliance']['dpdp_act_2023']['score']}")
            print("==============================================================")
            return True
        elif st.get("status") == "failed":
            print("Audit failed:", st.get("error"))
            return False

    print("Audit timed out.")
    return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
