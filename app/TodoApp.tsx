"use client";

import { useState, useEffect } from "react";

// ToDoリストの型
type Todo = {
  id: number;
  text: string;
  done: boolean;
}

// フィルターの状態の型
type Filter = "all" | "active" | "done";

export default function TodoApp() {
  // todosを初期化
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : []
  });

  // フィルターの状態の初期化
  const [filter, setFilter] = useState<Filter>("all");

  // todosが変わるたびにlocalStorageを更新
  useEffect(() => {
    if (todos === null) return;
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // 入力欄の初期化
  const [inputText, setInputText] = useState("");

  // 編集状態の初期化
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  // タスクを追加する関数
  const addTodo = () => {
    // trim：スぺース、改行を取り除くメソッド
    if (inputText.trim() === "") return      // 空文字は追加しない
    const newTodo: Todo = {
      id: Date.now(),        // 現在時刻をIDとして使う
      text: inputText.trim(),
      done: false,
    };
    setTodos([...todos, newTodo]);
    setInputText("");        // 入力欄をリセット
  }

  // タスクを削除する関数
  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  // タスクの完了・未完了を切り替える関数
  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  // フィルターで絞り込み
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.done;   // 未完了(完了済み以外)
    if (filter === "done") return todo.done;      // 完了済みだけ
    return true;
  })

  // 編集モードに入る
  const startEdit = (id: number, text: string) => {
    setEditingId(id);
    setEditingText(text);
  }

  // 編集状態を初期化
  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  }

  // 編集を保存
  const saveEdit = () => {
    // 空の場合保存しない
    if (editingText.trim() === "") return;

    setTodos(todos.map((todo) =>
      todo.id === editingId ? { ...todo, text: editingText.trim() } : todo
    ));
    cancelEdit();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">ToDoリスト</h1>

        {/* 入力フォーム */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="タスクを入力..."
            className="flex-1 border border-gary-300 rounded-lg px-4 py-2 text-sm
             outline-none focus:ring-2 focus:ring-blue-400 text-black"
          />
          <button
            onClick={addTodo}
            className="bg-blue-500 hover:bg-blue-600 text-white
             text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            追加
          </button>
        </div>

        {/* タスク一覧 */}
        <div className="flex gap-2 mb-4">
          {(["all", "active", "done"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${filter === f
                ? "bg-blue-500 text-white border-blue-500"
                : "text-gray-500 border-gray-300 hover:border-blue-400"
                }`}
            >
              {f === "all" ? "全て" : f === "active" ? "未完了" : "完了済み"}
            </button>
          ))}
        </div>
        <ul className="space-y-2">
          {filteredTodos.map((todo) => (
            <li key={todo.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
                className="w-4 h-4 accent-blue-500"
              />
              {todo.id === editingId
                ? (
                  // 編集モード
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    onBlur={saveEdit}
                    autoFocus
                    className="flex-1 text-sm border-b border-blue-400 outline-none text-gray-700"
                  />
                ) : (
                  // 通常モード
                  <span
                    onDoubleClick={() => startEdit(todo.id, todo.text)}
                    className={`flex-1 text-sm ${todo.done ? "line-through text-gray-400" : "text-gray-700"}`}>
                    {todo.text}
                  </span>
                )}
              <button
                // アロー関数で包まないと、画面が描画された瞬間に実行されるので注意
                onClick={() => deleteTodo(todo.id)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                削除
              </button>
            </li>
          ))}
        </ul>

        {/* タスクが0件のとき */}
        {filteredTodos.length == 0 && (
          <p className="text-center text-sm text-gray-400 mt-4">タスクがありません</p>
        )}

      </div>
    </div>
  );
};