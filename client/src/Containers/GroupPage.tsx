import React, { FC, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Expense } from "../../../server/src/types/api";
import { Input, Checkbox, Button } from "antd";
import { getGroupForId, groups } from "../metadata";
import produce from "immer";
import { EPERM } from "constants";

type ClientExpense = {
  visible: boolean;
  selected: boolean;
  original: Expense;
  changes: {
    description: string | null;
  };
};

const GroupPage: FC = () => {
  const { id } = useParams<{ id: string | undefined }>();
  const group = id ? getGroupForId(parseInt(id)) : undefined;

  const [searchTearm, setSearchTerm] = useState("");

  const [batchDescription, setBatchDescription] = useState("");

  const [loading, setLoading] = useState(false);

  const [review, setReview] = useState(false);

  const [expenses, setExpenses] = useState<ClientExpense[]>();

  useEffect(() => {
    setExpenses([]);
    setSearchTerm("");
    setBatchDescription("");
    if (group) {
      setLoading(true);
      fetch(`/group/${group.id}/expenses`)
        .then((response) => response.json())
        .then((data) => {
          setExpenses(
            data.map((item: Expense) => {
              return {
                visible: true,
                selected: false,
                original: item,
                changes: {
                  description: null,
                },
              };
            })
          );
          setLoading(false);
        });
    }
  }, [group]);

  useEffect(() => {
    if (expenses?.length) {
      const filtered = expenses.map((expense) => {
        const visible =
          expense.original.description
            .toLocaleLowerCase()
            .indexOf(searchTearm.toLocaleLowerCase()) >= 0;
        return {
          ...expense,
          visible,
        };
      });
      setExpenses(filtered);
    }
  }, [searchTearm, review]);

  function handleChangeDescription(index: number, description: string) {
    if (expenses) {
      const nextExpenses = produce(expenses, (draftExpenses) => {
        const expense = draftExpenses[index];
        if (description) {
          if (description !== expense.original.description) {
            expense.changes.description = description;
          } else {
            expense.changes.description = null;
          }
        }
      });

      setExpenses(nextExpenses);
    }
  }

  function handleSelect(index: number) {
    if (expenses) {
      const nextExpenses = produce(expenses, (draftExpenses) => {
        const expense = draftExpenses[index];
        expense.selected = !expense.selected;
      });

      setExpenses(nextExpenses);
    }
  }

  function handleSelectMultiple() {
    setExpenses(
      expenses?.map((expense) => {
        return {
          ...expense,
          selected: expense.visible,
        };
      })
    );
  }

  function isBatch(): boolean {
    if (expenses) {
      let count = 0;
      for (let expense of expenses) {
        if (expense.selected) {
          count++;
        }
        if (count > 1) return true;
      }
    }
    return false;
  }

  function handleBatchApply() {
    setExpenses(
      expenses?.map((expense) => {
        if (expense.selected) {
          return {
            ...expense,
            changes: { description: batchDescription },
          };
        }
        return expense;
      })
    );
    setBatchDescription("");
  }

  function renderFilter() {
    if (review) return null;

    return (
      <Input
        placeholder="Search"
        value={searchTearm}
        onChange={(event) => setSearchTerm(event.currentTarget.value)}
        disabled={loading}
      />
    );
  }

  function renderBatch() {
    if (!review && isBatch()) {
      return (
        <>
          <hr />
          <Input
            value={batchDescription}
            onChange={(event) => setBatchDescription(event.currentTarget.value)}
            style={{ width: 200 }}
          />
          <Button
            onClick={() => handleBatchApply()}
            disabled={!batchDescription}
          >
            Batch Apply
          </Button>
          <hr />
          <Button onClick={() => handleSelectMultiple()}>Select Current</Button>
        </>
      );
    }

    return null;
  }

  function renderItem(expense: ClientExpense, index: number) {
    const toBeReviewed = !!expense.changes.description;

    return (
      <div
        key={expense.original.id}
        style={{
          display:
            expense.visible || (review && toBeReviewed) ? undefined : "none",
        }}
      >
        {!review ? (
          <>
            <Checkbox
              onChange={() => handleSelect(index)}
              checked={expense.selected}
            />
            <Input
              style={{ width: 200, marginRight: "20px" }}
              size="small"
              disabled={review}
              value={
                expense.changes.description || expense.original.description
              }
              onChange={(event) => {
                handleChangeDescription(index, event.currentTarget.value);
              }}
            />
          </>
        ) : (
          <span style={{ marginRight: 20 }}>{expense.changes.description}</span>
        )}

        {expense.changes.description ? (
          <span style={{ textDecoration: "line-through", color: "red" }}>
            {expense.original.description}
          </span>
        ) : null}
        <br />
      </div>
    );
  }

  return (
    <>
      <h1>
        Group: {group ? group.name : null}{" "}
        <a onClick={() => setReview(false)}>Batch</a> |{" "}
        <a onClick={() => setReview(true)}>Review</a>
      </h1>
      {renderFilter()}
      {renderBatch()}
      <hr />
      {loading ? "...loading" : null}
      {expenses?.map((expense, index) => renderItem(expense, index))}
    </>
  );
};

export default GroupPage;
