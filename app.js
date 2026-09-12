/**
 * 簡約暖色任務看板 (Warm Minimalist Kanban)
 * 純 JavaScript 邏輯：三欄狀態管理、HTML5 拖曳 (Drag & Drop)、localStorage 持久化
 */

(function () {
  'use strict';

  // 本地儲存鍵名
  const STORAGE_KEY = 'minimalist_warm_kanban_tasks_v2';
  const LEGACY_STORAGE_KEY = 'minimalist_warm_todo_tasks_v1';

  // 優先度權重與標籤設定 (High > Medium > Low)
  const PRIORITY_CONFIG = {
    high: { weight: 3, label: 'High', class: 'priority-high' },
    medium: { weight: 2, label: 'Medium', class: 'priority-medium' },
    low: { weight: 1, label: 'Low', class: 'priority-low' }
  };

  // 預設範例資料（展示不同欄位與優先度分佈）
  const DEFAULT_TASKS = [
    {
      id: 'task-demo-1',
      text: '整理季度成果與下週待辦清單',
      category: 'work',
      priority: 'high',
      dueDate: '2026-09-12',
      status: 'todo',
      createdAt: Date.now() - 7200000
    },
    {
      id: 'task-demo-2',
      text: '前端介面重構與三欄拖曳效果優化',
      category: 'work',
      priority: 'high',
      dueDate: '2026-09-08',
      status: 'process',
      createdAt: Date.now() - 3600000
    },
    {
      id: 'task-demo-3',
      text: '採買手沖咖啡豆與燕麥奶',
      category: 'life',
      priority: 'medium',
      dueDate: '2026-09-20',
      status: 'process',
      createdAt: Date.now() - 1800000
    },
    {
      id: 'task-demo-4',
      text: '晨間伸展與閱讀 20 分鐘',
      category: 'life',
      priority: 'low',
      dueDate: null,
      status: 'done',
      createdAt: Date.now() - 10800000
    }
  ];

  // 狀態管理
  let tasks = [];
  let currentFilter = 'all'; // 'all' | 'work' | 'life'
  let draggedTaskId = null; // 當前被拖曳的任務 ID

  // DOM 元素快取
  const currentDateEl = document.getElementById('currentDate');
  const progressBarEl = document.getElementById('progressBar');
  const progressTextEl = document.getElementById('progressText');
  const taskFormEl = document.getElementById('taskForm');
  const taskInputEl = document.getElementById('taskInput');
  const taskDueDateEl = document.getElementById('taskDueDate');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const countAllEl = document.getElementById('countAll');
  const countWorkEl = document.getElementById('countWork');
  const countLifeEl = document.getElementById('countLife');
  const countColTodoEl = document.getElementById('countColTodo');
  const countColProcessEl = document.getElementById('countColProcess');
  const countColDoneEl = document.getElementById('countColDone');
  const clearDoneBtn = document.getElementById('clearDoneBtn');

  // 欄位容器
  const dropzones = {
    todo: document.getElementById('tasksTodo'),
    process: document.getElementById('tasksProcess'),
    done: document.getElementById('tasksDone')
  };

  /**
   * 初始化應用程式
   */
  function init() {
    renderDate();
    loadTasks();
    bindFormAndFilterEvents();
    bindDragAndDropEvents();
    render();
  }

  /**
   * 顯示今日日期
   */
  function renderDate() {
    const now = new Date();
    const options = { month: 'numeric', day: 'numeric', weekday: 'short' };
    const dateStr = now.toLocaleDateString('zh-TW', options);
    if (currentDateEl) {
      currentDateEl.textContent = `🗓️ ${dateStr}`;
    }
  }

  /**
   * 載入任務資料，並支援從舊版 v1 無縫遷移
   */
  function loadTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        tasks = JSON.parse(stored) || [];
        // 確保每筆任務皆具備 priority 屬性
        tasks = tasks.map(t => ({
          ...t,
          priority: t.priority || 'medium'
        }));
      } else {
        // 嘗試檢查是否有舊版資料需遷移
        const legacyStored = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyStored !== null) {
          const legacyTasks = JSON.parse(legacyStored) || [];
          tasks = legacyTasks.map(t => ({
            id: t.id || generateId(),
            text: t.text,
            category: t.category || 'work',
            priority: t.priority || 'medium',
            status: t.status || (t.completed ? 'done' : 'todo'),
            createdAt: t.createdAt || Date.now()
          }));
          saveTasks();
        } else {
          // 初次使用預設範例
          tasks = [...DEFAULT_TASKS];
          saveTasks();
        }
      }
    } catch (e) {
      console.error('讀取本機任務資料失敗：', e);
      tasks = [...DEFAULT_TASKS];
    }
  }

  /**
   * 將任務持久化儲存至 localStorage
   */
  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('儲存任務資料至 localStorage 失敗：', e);
    }
  }

  /**
   * 產生唯一 ID
   */
  function generateId() {
    if (window.crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }

  /**
   * HTML 跳脫防範 XSS
   */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * 新增任務（預設進入 To-do 欄位，附帶類別與優先度）
   */
  function handleAddTask(e) {
    e.preventDefault();
    const text = taskInputEl.value.trim();
    if (!text) return;

    const categoryInput = document.querySelector('input[name="taskCategory"]:checked');
    const category = categoryInput ? categoryInput.value : 'work';

    const priorityInput = document.querySelector('input[name="taskPriority"]:checked');
    const priority = priorityInput ? priorityInput.value : 'medium';

    const dueDate = taskDueDateEl ? taskDueDateEl.value.trim() : '';

    const newTask = {
      id: generateId(),
      text: text,
      category: category,
      priority: priority,
      dueDate: dueDate || null,
      status: 'todo',
      createdAt: Date.now()
    };

    tasks.unshift(newTask);
    saveTasks();
    render();

    taskInputEl.value = '';
    if (taskDueDateEl) {
      taskDueDateEl.value = '';
    }
    taskInputEl.focus();
  }

  /**
   * 移動任務狀態 (todo / process / done)
   */
  function moveTaskStatus(id, targetStatus) {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      const [task] = tasks.splice(index, 1);
      task.status = targetStatus;
      tasks.unshift(task); // 置於最前排
      saveTasks();
      render();
    }
  }

  /**
   * 刪除任務
   */
  function deleteTask(id, cardEl) {
    if (cardEl) {
      cardEl.classList.add('deleting');
      setTimeout(() => {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        render();
      }, 180);
    } else {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      render();
    }
  }

  /**
   * 清空已完成欄位
   */
  function clearDoneTasks() {
    const doneCount = tasks.filter(t => t.status === 'done').length;
    if (doneCount === 0) return;

    tasks = tasks.filter(t => t.status !== 'done');
    saveTasks();
    render();
  }

  /**
   * 切換分類篩選
   */
  function handleFilterChange(filter) {
    currentFilter = filter;
    filterTabs.forEach(tab => {
      if (tab.dataset.filter === filter) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    renderColumns();
  }

  /**
   * 更新統計資訊、進度條與欄位計數
   */
  function updateStats() {
    const totalCount = tasks.length;
    const doneCount = tasks.filter(t => t.status === 'done').length;
    const workCount = tasks.filter(t => t.category === 'work').length;
    const lifeCount = tasks.filter(t => t.category === 'life').length;

    const todoCount = tasks.filter(t => t.status === 'todo').length;
    const processCount = tasks.filter(t => t.status === 'process').length;

    // 分類篩選標籤計數
    if (countAllEl) countAllEl.textContent = totalCount;
    if (countWorkEl) countWorkEl.textContent = workCount;
    if (countLifeEl) countLifeEl.textContent = lifeCount;

    // 各欄位計數
    if (countColTodoEl) countColTodoEl.textContent = todoCount;
    if (countColProcessEl) countColProcessEl.textContent = processCount;
    if (countColDoneEl) countColDoneEl.textContent = doneCount;

    // 整體進度條
    const percentage = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
    if (progressBarEl) {
      progressBarEl.style.width = `${percentage}%`;
    }
    if (progressTextEl) {
      progressTextEl.textContent = `${doneCount} / ${totalCount} 完成 (${percentage}%)`;
    }

    // 清空完成任務按鈕顯示
    if (clearDoneBtn) {
      clearDoneBtn.style.display = doneCount > 0 ? 'inline-block' : 'none';
    }
  }

  /**
   * 渲染三個欄位的卡片清單
   */
  function renderColumns() {
    const statuses = ['todo', 'process', 'done'];

    statuses.forEach(status => {
      const container = dropzones[status];
      if (!container) return;

      // 依分類過濾
      const columnTasks = tasks.filter(task => {
        if (task.status !== status) return false;
        if (currentFilter === 'work') return task.category === 'work';
        if (currentFilter === 'life') return task.category === 'life';
        return true;
      });

      // 按照任務優先程度排序：High > Medium > Low，相同優先度依建立時間降冪 (新任務在前)
      columnTasks.sort((a, b) => {
        const weightA = PRIORITY_CONFIG[a.priority]?.weight ?? 2;
        const weightB = PRIORITY_CONFIG[b.priority]?.weight ?? 2;
        if (weightB !== weightA) {
          return weightB - weightA;
        }
        return (b.createdAt || 0) - (a.createdAt || 0);
      });

      if (columnTasks.length === 0) {
        let emptyHint = '目前無任務';
        let emptyIcon = '📝';
        if (status === 'todo') {
          emptyHint = '暫無待辦，新增一個吧！';
          emptyIcon = '☕';
        } else if (status === 'process') {
          emptyHint = '可將任務拖曳至此開始專注';
          emptyIcon = '⚡';
        } else if (status === 'done') {
          emptyHint = '完成的任務將匯聚在此';
          emptyIcon = '✨';
        }

        container.innerHTML = `
          <div class="column-empty">
            <span class="column-empty-icon">${emptyIcon}</span>
            <p>${emptyHint}</p>
          </div>
        `;
      } else {
        container.innerHTML = columnTasks.map(task => {
          const categoryLabel = task.category === 'work' ? '工作' : '生活';
          const categoryClass = task.category === 'work' ? 'work' : 'life';

          const priorityKey = task.priority || 'medium';
          const priorityInfo = PRIORITY_CONFIG[priorityKey] || PRIORITY_CONFIG.medium;

          // 產生輔助跨欄快速移動按鈕（方便觸控或鍵盤操作）
          let stageButtonsHtml = '';
          if (status === 'todo') {
            stageButtonsHtml = `
              <button type="button" class="btn-stage" data-action="stage" data-target="process" title="移至 Process">
                進行中 ›
              </button>
            `;
          } else if (status === 'process') {
            stageButtonsHtml = `
              <button type="button" class="btn-stage" data-action="stage" data-target="todo" title="移回 To-do">
                ‹ 待辦
              </button>
              <button type="button" class="btn-stage" data-action="stage" data-target="done" title="完成任務">
                完成 ›
              </button>
            `;
          } else if (status === 'done') {
            stageButtonsHtml = `
              <button type="button" class="btn-stage" data-action="stage" data-target="process" title="移回 Process">
                ‹ 返回進行中
              </button>
            `;
          }

          // 截止日期標籤邏輯
          let dueDateBadgeHtml = '';
          if (task.dueDate) {
            // 格式化為「年/月/日」 (YYYY/MM/DD)
            const formattedDate = task.dueDate.replace(/-/g, '/');

            // 判斷是否為今天或已過期
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;

            const isOverdueOrToday = task.dueDate <= todayStr;
            const badgeClass = isOverdueOrToday ? 'due-date-badge overdue' : 'due-date-badge';

            dueDateBadgeHtml = `
              <span class="${badgeClass}" title="截止日期：${formattedDate}${isOverdueOrToday ? ' (今天/已過期)' : ''}">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                ${formattedDate}
              </span>
            `;
          }

          return `
            <div 
              class="task-card" 
              draggable="true" 
              data-id="${task.id}"
              tabindex="0"
            >
              <div class="card-header">
                <div class="card-tags">
                  <span class="category-badge ${categoryClass}">${categoryLabel}</span>
                  <span class="priority-badge ${priorityInfo.class}">${priorityInfo.label}</span>
                  ${dueDateBadgeHtml}
                </div>
                <div class="card-actions">
                  <button type="button" class="btn-card-action btn-delete" data-action="delete" title="刪除任務" aria-label="刪除任務">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="card-text">${escapeHtml(task.text)}</div>

              <div class="card-footer">
                <span class="drag-handle-hint" title="可按住拖曳至其他欄位">⠿ 拖曳移動</span>
                <div class="stage-move-buttons">
                  ${stageButtonsHtml}
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    });
  }

  /**
   * 完整重新渲染
   */
  function render() {
    updateStats();
    renderColumns();
  }

  /**
   * 綁定表單、篩選與點擊操作
   */
  function bindFormAndFilterEvents() {
    // 新增任務
    taskFormEl.addEventListener('submit', handleAddTask);

    // 篩選頁籤
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        handleFilterChange(tab.dataset.filter);
      });
    });

    // 清空完成欄位按鈕
    if (clearDoneBtn) {
      clearDoneBtn.addEventListener('click', clearDoneTasks);
    }

    // 看板點擊委派（刪除、快速階段移動按鈕）
    document.querySelector('.kanban-board').addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('button[data-action="delete"]');
      const stageBtn = e.target.closest('button[data-action="stage"]');
      const cardEl = e.target.closest('.task-card');

      if (!cardEl) return;
      const taskId = cardEl.dataset.id;

      if (deleteBtn) {
        deleteTask(taskId, cardEl);
      } else if (stageBtn) {
        const targetStatus = stageBtn.dataset.target;
        if (targetStatus) {
          moveTaskStatus(taskId, targetStatus);
        }
      }
    });
  }

  /**
   * 綁定 HTML5 Drag & Drop 拖曳事件
   */
  function bindDragAndDropEvents() {
    const kanbanBoard = document.querySelector('.kanban-board');

    // 1. 拖曳啟動 (dragstart)
    kanbanBoard.addEventListener('dragstart', (e) => {
      const card = e.target.closest('.task-card');
      if (!card) return;

      draggedTaskId = card.dataset.id;
      card.classList.add('dragging');

      // 設定 DataTransfer 資料
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', draggedTaskId);
    });

    // 2. 拖曳結束 (dragend)
    kanbanBoard.addEventListener('dragend', (e) => {
      const card = e.target.closest('.task-card');
      if (card) {
        card.classList.remove('dragging');
      }
      draggedTaskId = null;
      // 清除所有 dropzone 懸停高亮
      document.querySelectorAll('.column-tasks').forEach(zone => {
        zone.classList.remove('drag-over');
      });
    });

    // 3. 欄位放置區事件綁定 (dragover, dragleave, drop)
    const dropzoneList = document.querySelectorAll('.column-tasks');

    dropzoneList.forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        zone.classList.add('drag-over');
      });

      zone.addEventListener('dragleave', (e) => {
        // 避免子元素觸發導致提早移除
        if (!zone.contains(e.relatedTarget)) {
          zone.classList.remove('drag-over');
        }
      });

      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');

        const targetStatus = zone.dataset.dropzone;
        const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;

        if (taskId && targetStatus) {
          moveTaskStatus(taskId, targetStatus);
        }
      });
    });
  }

  // 啟動應用
  document.addEventListener('DOMContentLoaded', init);
})();
