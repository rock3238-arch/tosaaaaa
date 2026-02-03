let userId = localStorage.getItem("userId");
if (!userId) {
  userId = Date.now().toString();
  localStorage.setItem("userId", userId);
}

let reviews = JSON.parse(localStorage.getItem("reviews")) || [];

function addReview() {
  if (!className.value) {
    alert("授業名を入力してください");
    return;
  }

  reviews.push({
    id: Date.now(),
    userId,
    university: university.value,
    faculty: faculty.value,
    className: className.value,
    easy: Number(easy.value),
    report: Number(report.value),
    attendance: Number(attendance.value),
    comment: comment.value
  });

  localStorage.setItem("reviews", JSON.stringify(reviews));
  className.value = comment.value = "";
  renderAll();
}

function renderAll() {
  const container = document.getElementById("reviews");
  container.innerHTML = "";

  const keyword = document.getElementById("search").value.toLowerCase();
  const sort = document.getElementById("sort").value;

  let grouped = {};

  reviews.forEach(r => {
    if (
      keyword &&
      !`${r.className}${r.university}`.toLowerCase().includes(keyword)
    ) return;

    const key = `${r.university}_${r.faculty}_${r.className}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  let groups = Object.values(grouped).map(group => {
    const avg = Math.round(group.reduce((s, r) => s + r.easy, 0) / group.length);
    return { group, avg };
  });

  if (sort === "easy") groups.sort((a, b) => b.avg - a.avg);
  if (sort === "hard") groups.sort((a, b) => a.avg - b.avg);

  groups.forEach(({ group, avg }) => {
    let label = "普通", cls = "normal";
    if (avg >= 4) { label = "楽単"; cls = "easy"; }
    if (avg <= 2) { label = "鬼単"; cls = "hard"; }

    const div = document.createElement("div");
    div.className = "class-group";
    div.innerHTML = `
      <h3>${group[0].className}
      <span class="tag ${cls}">${label}</span></h3>
      <p>${group[0].university} ${group[0].faculty}</p>
      <p>平均評価：${"★".repeat(avg)}</p>
    `;

    group.forEach(r => {
      const c = document.createElement("div");
      c.className = "comment";
      c.textContent = `・${r.comment}`;
      div.appendChild(c);

      if (r.userId === userId) {
        const btn = document.createElement("button");
        btn.textContent = "削除";
        btn.onclick = () => deleteReview(r.id);
        div.appendChild(btn);
      }
    });

    container.appendChild(div);
  });
}

function deleteReview(id) {
  if (!confirm("この投稿を削除しますか？")) return;
  reviews = reviews.filter(r => r.id !== id);
  localStorage.setItem("reviews", JSON.stringify(reviews));
  renderAll();
}

renderAll();
