// 队伍信息（赞助商和队伍名称分开）
const teams = [
  { sponsor: "福畅智达", name: "冥界" },
  { sponsor: "谦秋子皮", name: "大飞" },
  { sponsor: "星肾宝", name: "大熊" },
  { sponsor: "东方振兴", name: "小乖" },
  { sponsor: "杭州小圈", name: "约定" },
  { sponsor: "脆升升", name: "柒月" },
  { sponsor: "Eyebre", name: "荒年" },
  { sponsor: "海洋至尊", name: "My弟" },
  { sponsor: "OMG", name: "弑神" },
  { sponsor: "饱咕噜", name: "陈奕迅" },
  { sponsor: "盟趣", name: "杨无敌" },
];

// 对战记录数据
let matches = [];

// 队伍积分数据
let teamStats = {};

// 本地存储相关函数
function saveMatchesToStorage() {
  try {
    localStorage.setItem("16league_matches", JSON.stringify(matches));
    console.log("对战数据已保存到本地存储");
  } catch (error) {
    console.error("保存数据到本地存储失败:", error);
  }
}

function loadMatchesFromStorage() {
  try {
    const savedMatches = localStorage.getItem("16league_matches");
    if (savedMatches) {
      matches = JSON.parse(savedMatches);
      console.log("从本地存储加载了", matches.length, "条对战记录");
    } else {
      matches = [];
      console.log("本地存储中没有对战数据，初始化为空数组");
    }
  } catch (error) {
    console.error("从本地存储加载数据失败:", error);
    matches = [];
  }
}

function clearAllData() {
  if (confirm("确定要清除所有对战数据吗？此操作不可恢复！")) {
    matches = [];
    localStorage.removeItem("16league_matches");
    updateTeamStats();
    renderBattleTable();
    renderRankings();
    console.log("所有对战数据已清除");
  }
}

// 初始化队伍统计
function initializeTeamStats() {
  teams.forEach((team) => {
    teamStats[team.name] = {
      sponsor: team.sponsor,
      matches: 0,
      wins: 0,
      losses: 0,
      points: 0,
    };
  });
}

// 更新队伍统计
function updateTeamStats() {
  // 重置统计
  initializeTeamStats();

  // 根据对战记录更新统计
  matches.forEach((match) => {
    const team1 = match.team1;
    const team2 = match.team2;
    const score1 = parseInt(match.score1);
    const score2 = parseInt(match.score2);

    teamStats[team1].matches++;
    teamStats[team2].matches++;

    // 新的积分规则：每次对战打两次
    // 2:0 积3分，1:1 积1分，0:2 积0分
    if (score1 === 2 && score2 === 0) {
      // 队伍1获胜 2:0
      teamStats[team1].wins++;
      teamStats[team1].points += 3;
      teamStats[team2].losses++;
    } else if (score1 === 0 && score2 === 2) {
      // 队伍2获胜 0:2
      teamStats[team2].wins++;
      teamStats[team2].points += 3;
      teamStats[team1].losses++;
    } else if (score1 === 1 && score2 === 1) {
      // 平局 1:1，各得1分
      teamStats[team1].points += 1;
      teamStats[team2].points += 1;
    } else {
      // 其他情况（如未完成比赛）
      teamStats[team1].points += 0;
      teamStats[team2].points += 0;
    }
  });
}

// 渲染对战表格
function renderBattleTable() {
  const tbody = document.getElementById("battleTableBody");
  tbody.innerHTML = "";

  // 按比赛ID排序（最新的在前面）
  const sortedMatches = [...matches].sort((a, b) => b.id - a.id);

  sortedMatches.forEach((match, index) => {
    const team1Info = teams.find((t) => t.name === match.team1);
    const team2Info = teams.find((t) => t.name === match.team2);
    const originalIndex = matches.findIndex((m) => m.id === match.id);

    const row = document.createElement("tr");
    row.innerHTML = `
              <td class="ranking-number">${index + 1}</td>
              <td>${match.id}</td>
              <td class="sponsor-name">${
                team1Info ? team1Info.sponsor : ""
              }</td>
              <td class="team-name">${match.team1}</td>
              <td class="score-display">${match.score1}:${match.score2}</td>
              <td class="team-name">${match.team2}</td>
              <td class="sponsor-name">${
                team2Info ? team2Info.sponsor : ""
              }</td>
              <td>${match.date}</td>
              <td>${match.status}</td>
              <td>
                  <button class="delete-btn" onclick="deleteMatch(${originalIndex})">删除</button>
              </td>
          `;
    tbody.appendChild(row);
  });
}

// 渲染排行榜
function renderRankings() {
  const tbody = document.getElementById("rankingsTableBody");
  tbody.innerHTML = "";

  // 按积分排序
  const sortedTeams = Object.entries(teamStats).sort(
    (a, b) => b[1].points - a[1].points
  );

  sortedTeams.forEach(([teamName, stats], index) => {
    const winRate =
      stats.matches > 0
        ? ((stats.wins / stats.matches) * 100).toFixed(1)
        : "0.0";
    const rankClass = index < 3 ? `rank-${index + 1}` : "";

    const row = document.createElement("tr");
    row.innerHTML = `
              <td class="${rankClass}">${index + 1}</td>
              <td class="sponsor-name">${stats.sponsor}</td>
              <td class="team-name clickable-team" onclick="showTeamDetails('${teamName}')" title="点击查看对战详情">${teamName}</td>
              <td>${stats.matches}</td>
              <td>${stats.wins}</td>
              <td>${stats.losses}</td>
              <td>${winRate}%</td>
              <td class="points-display">${stats.points}</td>
          `;
    tbody.appendChild(row);
  });
}

// 删除对战
function deleteMatch(index) {
  if (confirm("确定要删除这场对战吗？")) {
    matches.splice(index, 1);
    updateTeamStats();
    renderBattleTable();
    renderRankings();
    saveMatchesToStorage(); // 保存到本地存储
  }
}

// 检查是否已经对战过
function hasPlayedBefore(team1, team2) {
  return matches.some(
    (match) =>
      (match.team1 === team1 && match.team2 === team2) ||
      (match.team1 === team2 && match.team2 === team1)
  );
}

// 更新队伍选择器（过滤已对战过的队伍）
function updateTeamSelectors() {
  const team1Select = document.getElementById("team1");
  const team2Select = document.getElementById("team2");
  const matchStatus = document.getElementById("matchStatus");
  const selectedTeam1 = team1Select.value;
  const selectedTeam2 = team2Select.value;

  // 清空选项
  team1Select.innerHTML = '<option value="">选择队伍</option>';
  team2Select.innerHTML = '<option value="">选择队伍</option>';

  teams.forEach((team) => {
    const option1 = document.createElement("option");
    option1.value = team.name;
    option1.textContent = `${team.sponsor}-${team.name}`;

    const option2 = document.createElement("option");
    option2.value = team.name;
    option2.textContent = `${team.sponsor}-${team.name}`;

    // 添加队伍1选项（如果当前没有选择队伍2，或者选择的队伍2与当前队伍没有对战过）
    if (!selectedTeam2 || !hasPlayedBefore(team.name, selectedTeam2)) {
      team1Select.appendChild(option1);
    }

    // 添加队伍2选项（如果当前没有选择队伍1，或者选择的队伍1与当前队伍没有对战过）
    if (!selectedTeam1 || !hasPlayedBefore(selectedTeam1, team.name)) {
      team2Select.appendChild(option2);
    }
  });

  // 恢复选择的值
  if (selectedTeam1) team1Select.value = selectedTeam1;
  if (selectedTeam2) team2Select.value = selectedTeam2;

  // 显示对战状态
  if (selectedTeam1 && selectedTeam2) {
    if (hasPlayedBefore(selectedTeam1, selectedTeam2)) {
      matchStatus.textContent = "⚠️ 这两个队伍已经对战过了！";
      matchStatus.className = "match-status warning";
    } else {
      matchStatus.textContent = "✅ 可以添加新的对战";
      matchStatus.className = "match-status success";
    }
  } else {
    matchStatus.className = "match-status hidden";
  }
}

// 打开添加对战模态框
function openAddMatchModal() {
  document.getElementById("addMatchForm").reset();
  document.querySelector("#addMatchModal h3").textContent = "添加新对战";
  updateTeamSelectors();
  document.getElementById("addMatchModal").style.display = "block";
}

// 关闭模态框
function closeModal() {
  document.getElementById("addMatchModal").style.display = "none";
}

// 初始化队伍选择器
function initializeTeamSelectors() {
  const team1Select = document.getElementById("team1");
  const team2Select = document.getElementById("team2");

  teams.forEach((team) => {
    const option1 = document.createElement("option");
    option1.value = team.name;
    option1.textContent = `${team.sponsor}-${team.name}`;
    team1Select.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = team.name;
    option2.textContent = `${team.sponsor}-${team.name}`;
    team2Select.appendChild(option2);
  });

  // 添加队伍选择变化监听器
  team1Select.addEventListener("change", function () {
    updateTeamSelectors();
  });

  team2Select.addEventListener("change", function () {
    updateTeamSelectors();
  });
}

// 添加对战表单提交
document
  .getElementById("addMatchForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const team1 = document.getElementById("team1").value;
    const team2 = document.getElementById("team2").value;
    const matchResult = document.querySelector(
      'input[name="matchResult"]:checked'
    )?.value;
    const matchDate = document.getElementById("matchDate").value;

    if (team1 === team2) {
      alert("不能选择相同的队伍！");
      return;
    }

    // 检查是否已经对战过
    if (hasPlayedBefore(team1, team2)) {
      alert("这两个队伍已经对战过了！");
      return;
    }

    // 解析比分
    let score1, score2;
    switch (matchResult) {
      case "2:0":
        score1 = 2;
        score2 = 0;
        break;
      case "1:1":
        score1 = 1;
        score2 = 1;
        break;
      case "0:2":
        score1 = 0;
        score2 = 2;
        break;
      default:
        alert("请选择有效的比赛结果！");
        return;
    }

    // 添加新对战
    const newMatch = {
      id: matches.length + 1,
      team1: team1,
      score1: score1,
      team2: team2,
      score2: score2,
      date: matchDate,
      status: "已完成",
    };
    matches.push(newMatch);

    updateTeamStats();
    renderBattleTable();
    renderRankings();
    saveMatchesToStorage(); // 保存到本地存储
    closeModal();
  });

// 点击模态框外部关闭
window.onclick = function (event) {
  const modal = document.getElementById("addMatchModal");
  const detailsModal = document.getElementById("teamDetailsModal");

  if (event.target === modal) {
    closeModal();
  }

  if (event.target === detailsModal) {
    closeDetailsModal();
  }
};

// 初始化页面
function initializePage() {
  initializeTeamStats();
  initializeTeamSelectors();

  // 从本地存储加载数据
  loadMatchesFromStorage();

  updateTeamStats();
  renderBattleTable();
  renderRankings();
}

// 显示队伍对战详情
function showTeamDetails(teamName) {
  const teamMatches = matches.filter(
    (match) => match.team1 === teamName || match.team2 === teamName
  );

  const teamInfo = teams.find((t) => t.name === teamName);
  const stats = teamStats[teamName];

  // 创建详情内容
  let detailsContent = `
    <div class="team-details-header">
      <h3>${teamInfo.sponsor} - ${teamName}</h3>
      <div class="team-stats-summary">
        <div class="stat-item">
          <span class="stat-label">总场次:</span>
          <span class="stat-value">${stats.matches}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">胜场:</span>
          <span class="stat-value">${stats.wins}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">负场:</span>
          <span class="stat-value">${stats.losses}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">积分:</span>
          <span class="stat-value">${stats.points}</span>
        </div>
      </div>
    </div>
    <div class="team-matches-list">
      <h4>对战记录</h4>
  `;

  if (teamMatches.length === 0) {
    detailsContent += '<p class="no-matches">暂无对战记录</p>';
  } else {
    detailsContent += '<div class="matches-table">';
    teamMatches.forEach((match) => {
      const opponent = match.team1 === teamName ? match.team2 : match.team1;
      const opponentInfo = teams.find((t) => t.name === opponent);
      const isWin =
        (match.team1 === teamName && match.score1 > match.score2) ||
        (match.team2 === teamName && match.score2 > match.score1);
      const isDraw = match.score1 === match.score2;

      let resultClass = "draw";
      let resultText = "平局";
      if (isWin) {
        resultClass = "win";
        resultText = "胜利";
      } else if (!isDraw) {
        resultClass = "loss";
        resultText = "失败";
      }

      detailsContent += `
        <div class="match-item ${resultClass}">
          <div class="match-date">${match.date}</div>
          <div class="match-opponent">${teamInfo.sponsor}-${teamName} vs ${opponentInfo.sponsor}-${opponent}</div>
          <div class="match-score">${match.score1}:${match.score2}</div>
          <div class="match-result">${resultText}</div>
        </div>
      `;
    });
    detailsContent += "</div>";
  }

  detailsContent += "</div>";

  // 显示模态框
  showDetailsModal(detailsContent);
}

// 显示详情模态框
function showDetailsModal(content) {
  const modal = document.getElementById("teamDetailsModal");
  const modalContent = document.getElementById("teamDetailsContent");

  modalContent.innerHTML = content;
  modal.style.display = "block";
}

// 关闭详情模态框
function closeDetailsModal() {
  document.getElementById("teamDetailsModal").style.display = "none";
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", initializePage);
