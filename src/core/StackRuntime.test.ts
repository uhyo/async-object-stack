import assert from "node:assert/strict";
import { test } from "node:test";
import { createAsyncObjectStack } from "../node.js";

test("Basic behavior", async (t) => {
  await t.test("render()", async (t) => {
    await t.test("throws when called outside of a region", () => {
      const stack = createAsyncObjectStack();
      assert.throws(
        () => {
          stack.render();
        },
        {
          message:
            "StackRuntime#render must be called inside a region() callback",
        },
      );
    });
    await t.test("returns an empty object when no objects are pushed", () => {
      const stack = createAsyncObjectStack();
      stack.region(() => {
        assert.deepEqual(stack.render(), Object.create(null));
      });
    });
  });
  await t.test("push()", async (t) => {
    await t.test("throws when called outside of a region", () => {
      const stack = createAsyncObjectStack();
      assert.throws(
        () => {
          stack.push({});
        },
        {
          message:
            "StackRuntime#push must be called inside a region() callback",
        },
      );
    });
    await t.test("pushed object is reflected", () => {
      const stack = createAsyncObjectStack();
      stack.region(() => {
        const obj1 = { pika: "chu" };
        using guard = stack.push(obj1);
        assert.deepEqual(stack.render(), nullPrototype({ pika: "chu" }));
      });
    });
    await t.test("When guard is disposed, pushed object is removed", () => {
      const stack = createAsyncObjectStack();
      stack.region(() => {
        const obj1 = { pika: "chu" };
        {
          using guard = stack.push(obj1);
          assert.deepEqual(stack.render(), nullPrototype({ pika: "chu" }));
          {
            using guard = stack.push({ abc: "def" });
            assert.deepEqual(
              stack.render(),
              nullPrototype({ pika: "chu", abc: "def" }),
            );
          }
          assert.deepEqual(stack.render(), nullPrototype({ pika: "chu" }));
        }
        assert.deepEqual(stack.render(), Object.create(null));
      });
    });
    await t.test("Region is available in functions", async () => {
      const stack = createAsyncObjectStack();
      async function inner() {
        using guard = stack.push({
          hello: "world",
        });
        assert.deepEqual(
          stack.render(),
          nullPrototype({ pika: "chu", hello: "world" }),
        );
      }
      await stack.region(async () => {
        using guard = stack.push({ pika: "chu" });
        await inner();
      });
    });
  });
});
test("region()", async (t) => {
  await t.test("inner region inherits outer region", async () => {
    const stack = createAsyncObjectStack();
    await stack.region(async () => {
      const obj1 = { pika: "chu" };
      using guard = stack.push(obj1);
      await stack.region(async () => {
        assert.deepEqual(stack.render(), nullPrototype({ pika: "chu" }));
        using guard = stack.push({ abc: "def" });
        assert.deepEqual(
          stack.render(),
          nullPrototype({ pika: "chu", abc: "def" }),
        );
      });
    });
  });
  await t.test("inner region does not affect outer region", async () => {
    const stack = createAsyncObjectStack();
    await stack.region(async () => {
      const obj1 = { pika: "chu" };
      using guard = stack.push(obj1);
      const list: number[] = [];

      const inner = async () => {
        using guard = stack.push({ pika: "pika", abc: "def" });
        list.push(1);
        await microSleep(2);
        assert.deepEqual(
          stack.render(),
          nullPrototype({ pika: "pika", abc: "def" }),
        );
      };

      const innerP = stack.region(inner);
      list.push(2);
      assert.deepEqual(stack.render(), nullPrototype({ pika: "chu" }));
      await innerP;
      assert.deepEqual(list, [1, 2]);
    });
  });
  await t.test(
    "modification to outer region does not affect inner region",
    async () => {
      const stack = createAsyncObjectStack();
      await stack.region(async () => {
        const inner = async () => {
          using guard = stack.push({ abc: "def" });
          await microSleep(2);
          assert.deepEqual(
            stack.render(),
            nullPrototype({ pika: "chu", abc: "def" }),
          );
        };

        let innerP;
        let error: unknown;
        {
          const obj1 = { pika: "chu" };
          using guard = stack.push(obj1);
          innerP = stack.region(inner).catch((e) => (error = e));
        }
        await microSleep(1);
        assert.deepEqual(stack.render(), nullPrototype({}));
        await innerP;
        assert.ifError(error);
        assert.deepEqual(stack.render(), nullPrototype({}));
      });
    },
  );
});

function nullPrototype(object: object): object {
  return Object.assign(Object.create(null), object);
}

async function microSleep(count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    await Promise.resolve();
  }
}
