"use client";

import {SettingsContext, act} from "@/contexts/SettingsContext";
import {UnauthorizedContext} from "@/contexts/UnauthorizedContext";
import TextSelect from "@/app/components/TextSelect";
import DialogButton from "@/app/components/DialogButton";
import {useState, useEffect, useContext, useRef} from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DraggableProvided,
  type DraggableStateSnapshot,
  type DraggableRubric,
  type DraggableLocation,
} from "@hello-pangea/dnd";

export default function Entity({
  params: { id: e }
}: {
  params: { id: string }
}) {
  const [parent, setParent] = useState<string | null>(null);
  const [allSpaces, setAllSpaces] = useState<string[] | null>(null);
  const [forceRepaint, setForceRepaint] = useState(false);
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const settings = useContext(SettingsContext);
  const addUnauthorized = useContext(UnauthorizedContext);
  
  useEffect(() => {
    async function getParent() {
      try {
        const res = await act(settings, {
          r: {e: {s: e}}
        }, {
          401: () => addUnauthorized(`Couldn't Get Parent Of ${e}`),
        });
        setParent(res.r.s[0]); 
      } catch(e) {
        console.warn("Couldn't get parent", e);
      }
    }
    async function getAllSpaces() {
      try {
        const res = await act(settings, {
          r: "s"
        }, {
          401: () => addUnauthorized("Couldn't Read Spaces"),
        });
        setAllSpaces(res.r.s); 
      } catch(e) {
        console.warn("Couldn't read spaces", e);
      }
    }
    if (settings.actors.length > 0) {
      getParent();
      getAllSpaces();
    }
  }, [settings, e, forceRepaint]);

  if (settings.actors.length === 0 || !parent || !allSpaces) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const possibleParents = allSpaces.filter((s) => parent !== s);

  function changeParent(s: string) {
    async function go() {
      try {
        const res = await act(settings, {
          u: {e: {e, s}}
        }, {
          401: () => addUnauthorized(`Couldn't Move Entity ${e} To ${s}`),
        });
        setForceRepaint(!forceRepaint);
      } catch(e) {
        console.warn("Couldn't set entity parent", e);
      }
    }
    go();
  }

  const setParentContent = (
    <>
      <h3 className="font-bold text-lg">{`Set Parent For ${e}`}</h3>
      <TextSelect
        label="SpaceId"
        placeholder={"s_1234..."}
        options={possibleParents}
        onSelect={setSelectedParent} />
    </>
  );

  return (
    <>
      <div className="breadcrumbs text-sm">
        <ul>
          <li><a href="/spaces">Spaces</a></li>
          <li><a href={`/spaces/${parent}`}>{parent}</a></li>
          <li>{e}</li>
        </ul>
      </div>
      <DialogButton
        buttonText="Move To Different Space"
        buttonVariant="secondary"
        onSubmit={() => selectedParent && changeParent(selectedParent)}
        modalContent={setParentContent}
        submitText="Save"
        submitDisabled={!selectedParent}
        onCloseModal={() => setSelectedParent(null)}>{({button}) =>
        button
      }</DialogButton>
      <h3 className="font-bold text-lg">Forked From</h3>

      <h3 className="font-bold text-lg">Versions</h3>
      <Versions e={e} onUpdate={() => setForceRepaint(!forceRepaint)} />
    </>
  );
}

function Versions({
  e,
  onUpdate,
}: {
  e: string,
  onUpdate: () => void,
}) {
  const [versions, setVersions] = useState<string[] | null>(null);
  const [reorderedVersions, setReorderedVersions] = useState<string[] | null>(null);
  const [reorderingOperations, setReorderingOperations] =
    useState<{v: string, idx: number}[] | null>(null);
  const [forceRepaint, setForceRepaint] = useState(false);
  const settings = useContext(SettingsContext);
  const addUnauthorized = useContext(UnauthorizedContext);

  useEffect(() => {
    async function getVersions() {
      try {
        const res = await act(settings, {
          r: {v: e}
        }, {
          401: () => addUnauthorized(`Couldn't Read Versions Of ${e}`)
        });
        setVersions(res.r.v);
      } catch(e) {
        console.warn("Couldn't read versions", e);
      }
    }
    if (settings.actors.length > 0) {
      getVersions();
    }
  }, [settings, e, forceRepaint]);

  if (settings.actors.length === 0 || !versions) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  function onDragEnd({
    destination,
    draggableId,
  }: {
    destination: DraggableLocation | null,
    draggableId: string,
  }) {
    if (destination && reorderedVersions && reorderingOperations) {
      const v = draggableId;
      const idx = destination.index;
      const reorderedVersionsWithoutV = reorderedVersions.filter((v_) => v_ !== v);
      const newReorderedVersions = [
        ...reorderedVersionsWithoutV.slice(0, idx),
        v,
        ...reorderedVersionsWithoutV.slice(idx, reorderedVersions.length)
      ];
      setReorderedVersions(newReorderedVersions);
      setReorderingOperations([...reorderingOperations, { v, idx }]);
    }
  }

  const editVersion = (
    provided: DraggableProvided,
    state: DraggableStateSnapshot,
    rubric: DraggableRubric
  ) => (
    <li
      className="list-item"
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={{
        zIndex: 1000,
        ...provided.draggableProps.style,
      }}>
      <a>{rubric.draggableId}</a>
    </li>
  );

  const editVersions = reorderedVersions && (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="versions" renderClone={editVersion}>{(provided, state) => (
        <ol
          className="menu rounded-box list-decimal ml-4"
          reversed
          ref={provided.innerRef}
          {...provided.droppableProps}>
          {reorderedVersions.map((v, idx) => (
            <Draggable draggableId={v} index={idx} key={v}>{editVersion}</Draggable>
          ))}
          {provided.placeholder}
        </ol>
      )}</Droppable>
    </DragDropContext>
  );

  function submitReordering() {
    async function go() {
      if (reorderingOperations) {
        for (const {v, idx} of reorderingOperations) {
          const res = await act(settings, {
            u: {v: {v, i: idx}}
          }, {
            401: () => addUnauthorized(`Couldn't Move Version ${v}`),
          });
        }
        setForceRepaint(!forceRepaint);
        onUpdate();
      }
    }
    go();
  }

  const viewVersions = (
    <>
      <ol className="menu rounded-box list-decimal ml-4" reversed>
        {versions.map((v) => (
          <li key={v} className="list-item"><a href={`/versions/${v}`}>{v}</a></li>
        ))}
      </ol>
      <DialogButton
        buttonText="Change Order"
        buttonVariant="secondary"
        submitText="Save"
        submitVariant="primary"
        modalContent={editVersions}
        onSubmit={submitReordering}
        onOpenModal={() => {
          setReorderedVersions(versions)
          setReorderingOperations([]);
        }}
        onCloseModal={() => {
          setReorderedVersions(null);
          setReorderingOperations(null);
        }}>{({button}) =>
        button
      }</DialogButton>
    </>
  );

  function createVersion() {
    async function go() {
      try {
        const res = await act(settings, {
          c: {v: e}
        }, {
          401: () => addUnauthorized(`Couldn't Create Version For ${e}`),
        });
        setForceRepaint(!forceRepaint);
      } catch(e) {
        console.warn("Couldn't Create Version", e);
      }
    }
    go();
  }

  return (
    <>
      <div className="flex flex-row-reverse">
        <button
          onClick={createVersion}
          className="btn btn-primary">
          Create New Version
        </button>
      </div>
      {versions.length > 0 ? viewVersions : "none"}
    </>
  );
}
