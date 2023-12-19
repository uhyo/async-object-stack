import assert from "node:assert/strict";
import { test } from "node:test";
import { ObjectStack } from "./objectStack.js";

test("render()", async (t) => {
  await t.test("returns an empty object when no objects are pushed", () => {
    const stack = ObjectStack.create();
    assert.deepEqual(stack.render(), Object.create(null));
  });

  await t.test("returns an object with pushed objects", () => {
    const stack = ObjectStack.create();
    const obj1 = { pika: "chu" };
    stack.push(obj1);
    const result = stack.render();
    assert.notEqual(result, obj1);
    assert.deepEqual(result, nullPrototype({ pika: "chu" }));
  });

  await t.test("returns a merged object", () => {
    const stack = ObjectStack.create();
    const obj1 = { pika: "chu" };
    const obj2 = { a: "b" };
    stack.push(obj1);
    stack.push(obj2);
    const result = stack.render();
    assert.deepEqual(result, nullPrototype({ pika: "chu", a: "b" }));
  });

  await t.test("Later objects override earlier ones", () => {
    const stack = ObjectStack.create();
    const obj1 = { pika: "chu", a: "b" };
    const obj2 = { a: "c" };
    stack.push(obj1);
    stack.push(obj2);
    const result = stack.render();
    assert.deepEqual(result, nullPrototype({ pika: "chu", a: "c" }));
  });
});

test("push()", async (t) => {
  await t.test("pushed object is shallow copied", () => {
    const stack = ObjectStack.create();
    const obj1 = { pika: "chu" };
    stack.push(obj1);
    obj1.pika = "pika";
    assert.deepEqual(stack.render(), nullPrototype({ pika: "chu" }));
  });
  await t.test("pushed object is not deep copied", () => {
    const stack = ObjectStack.create();
    const obj1 = { pika: { chu: "chu" } };
    stack.push(obj1);
    obj1.pika.chu = "pika";
    assert.deepEqual(stack.render(), nullPrototype({ pika: { chu: "pika" } }));
  });

  await test("remove", async (t) => {
    await t.test("removes pushed object", () => {
      const stack = ObjectStack.create();
      const obj1 = { pika: "chu" };
      const remove = stack.push(obj1);
      remove();
      assert.deepEqual(stack.render(), Object.create(null));
    });

    await t.test("throws when remove function is called twice", () => {
      const stack = ObjectStack.create();
      const obj1 = { pika: "chu" };
      const remove = stack.push(obj1);
      remove();
      assert.throws(remove, { message: "Given object is not in the stack" });
    });
  });
});

test("child()", async (t) => {
  await t.test("returns a new instance", () => {
    const stack = ObjectStack.create();
    const child = stack.child();
    assert.notEqual(stack, child);
  });

  await t.test("inherits parent render result", () => {
    const stack = ObjectStack.create();
    stack.push({ pika: "chu" });
    const child = stack.child();
    assert.deepEqual(child.render(), nullPrototype({ pika: "chu" }));
  });

  await t.test("child render result is merged with parent", () => {
    const stack = ObjectStack.create();
    stack.push({ pika: "chu" });
    const child = stack.child();
    child.push({ a: "b" });
    assert.deepEqual(child.render(), nullPrototype({ pika: "chu", a: "b" }));
  });

  await t.test("child render result overrides parent", () => {
    const stack = ObjectStack.create();
    stack.push({ pika: "chu", a: "b" });
    const child = stack.child();
    child.push({ a: "c" });
    assert.deepEqual(child.render(), nullPrototype({ pika: "chu", a: "c" }));
  });
});

function nullPrototype(object: object): object {
  return Object.assign(Object.create(null), object);
}
